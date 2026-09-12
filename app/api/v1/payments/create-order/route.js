import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getRazorpayHeaders } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { bookingId, paymentMode } = body;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const booking = await db.collection('bookings').findOne({ bookingId });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Calculate amount based on payment mode
    const mode = paymentMode || booking.paymentMode || 'full';
    const totalAmountRupees = booking.totalAmount || 0;
    const totalAmountPaise = Math.round(totalAmountRupees * 100);
    const advanceAmountPaise = Math.ceil(totalAmountPaise * 0.2);
    
    const receipt = `rcpt_${bookingId}`;
    
    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: getRazorpayHeaders(),
      body: JSON.stringify({
        amount: mode === 'advance' ? advanceAmountPaise : totalAmountPaise,
        currency: 'INR',
        receipt,
        partial_payment: false,
        notes: {
          bookingId,
          guestName: booking.guestName,
          villaName: booking.villaName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        }
      }),
    });
    
    if (!razorpayResponse.ok) {
      const err = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', err);
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 502 });
    }
    
    const rzpOrder = await razorpayResponse.json();
    
    // Update booking with Razorpay order ID
    await db.collection('bookings').updateOne(
      { bookingId },
      { $set: { 
        razorpayOrderId: rzpOrder.id, 
        paymentMode: mode,
        updatedAt: new Date().toISOString() 
      }}
    );
    
    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      bookingId,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      villaName: booking.villaName,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
