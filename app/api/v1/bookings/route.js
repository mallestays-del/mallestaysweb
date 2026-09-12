import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/v1/bookings?bookingId=xxx or ?villaId=xxx
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const villaId = searchParams.get('villaId');
    
    const db = await getDatabase();
    
    if (bookingId) {
      const booking = await db.collection('bookings').findOne({ bookingId });
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json({ booking });
    }
    
    let query = {};
    if (villaId) query.villaId = villaId;
    
    const bookings = await db.collection('bookings').find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/v1/bookings - Create a new booking
export async function POST(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    
    const {
      villaId, villaName, villaSlug, villaLocation,
      checkIn, checkOut, guests,
      guestName, guestEmail, guestPhone, guestIdType, guestIdNumber,
      specialRequests,
      pricing, paymentMode
    } = body;
    
    // Validate required fields
    if (!villaId || !checkIn || !checkOut || !guestName || !guestPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check availability
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const datesToCheck = [];
    let current = new Date(startDate);
    while (current < endDate) {
      datesToCheck.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    // Check blocked dates
    const blockedDates = await db.collection('availability').find({
      villaId,
      date: { $in: datesToCheck }
    }).toArray();
    
    if (blockedDates.length > 0) {
      return NextResponse.json({ 
        error: 'Some dates are not available',
        unavailableDates: blockedDates.map(d => d.date)
      }, { status: 409 });
    }
    
    // Check existing bookings
    const existingBookings = await db.collection('bookings').find({
      villaId,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkIn: { $lt: checkOut, $gte: checkIn } },
        { checkOut: { $gt: checkIn, $lte: checkOut } },
        { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
      ]
    }).toArray();
    
    if (existingBookings.length > 0) {
      return NextResponse.json({ error: 'Villa is already booked for these dates' }, { status: 409 });
    }
    
    // Create booking
    const bookingId = 'MS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const booking = {
      bookingId,
      villaId,
      villaName: villaName || '',
      villaSlug: villaSlug || '',
      villaLocation: villaLocation || '',
      checkIn,
      checkOut,
      nights: datesToCheck.length,
      guests: guests || 2,
      guestName,
      guestEmail: guestEmail || '',
      guestPhone,
      guestIdType: guestIdType || '',
      guestIdNumber: guestIdNumber || '',
      specialRequests: specialRequests || '',
      pricing: pricing || {},
      paymentMode: paymentMode || 'full',
      paymentStatus: 'pending',
      razorpayOrderId: null,
      razorpayPaymentId: null,
      amountPaid: 0,
      totalAmount: pricing?.totalAmount || 0,
      advanceAmount: pricing?.advanceAmount || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('bookings').insertOne(booking);
    
    return NextResponse.json({ 
      booking,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/v1/bookings - Update booking status
export async function PUT(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { bookingId, status, paymentStatus, razorpayOrderId, razorpayPaymentId, amountPaid } = body;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }
    
    const update = { updatedAt: new Date().toISOString() };
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (razorpayOrderId) update.razorpayOrderId = razorpayOrderId;
    if (razorpayPaymentId) update.razorpayPaymentId = razorpayPaymentId;
    if (amountPaid !== undefined) update.amountPaid = amountPaid;
    
    const result = await db.collection('bookings').updateOne(
      { bookingId },
      { $set: update }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // If confirmed, block the dates
    if (status === 'confirmed') {
      const booking = await db.collection('bookings').findOne({ bookingId });
      if (booking) {
        const dates = [];
        let current = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        while (current < end) {
          dates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
        for (const date of dates) {
          await db.collection('availability').updateOne(
            { villaId: booking.villaId, date },
            { $set: { villaId: booking.villaId, date, reason: 'booking', bookingId, blockedAt: new Date().toISOString() } },
            { upsert: true }
          );
        }
      }
    }
    
    return NextResponse.json({ message: 'Booking updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
