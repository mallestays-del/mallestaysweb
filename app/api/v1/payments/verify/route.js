import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPaymentSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = body;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Find booking by Razorpay order ID
    const booking = await db.collection('bookings').findOne({ 
      razorpayOrderId: razorpay_order_id 
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found for this order' }, { status: 404 });
    }
    
    // Verify signature using stored order ID
    const isValid = verifyPaymentSignature(
      booking.razorpayOrderId,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
    
    // Calculate paid amount
    const mode = booking.paymentMode || 'full';
    const paidAmount = mode === 'advance' 
      ? Math.ceil(booking.totalAmount * 0.2) 
      : booking.totalAmount;
    
    // Update booking status
    await db.collection('bookings').updateOne(
      { bookingId: booking.bookingId },
      { $set: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: mode === 'advance' ? 'partial' : 'paid',
        amountPaid: paidAmount,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }}
    );
    
    // Block dates for confirmed booking
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
        { $set: { villaId: booking.villaId, date, reason: 'booking', bookingId: booking.bookingId, blockedAt: new Date().toISOString() } },
        { upsert: true }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      bookingId: booking.bookingId,
      paymentId: razorpay_payment_id,
      amountPaid: paidAmount,
      status: 'confirmed'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
