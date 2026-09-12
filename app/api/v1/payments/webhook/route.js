import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (signature) {
      const isValid = verifyWebhookSignature(raw, signature);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new NextResponse('Invalid signature', { status: 400 });
      }
    }
    
    const event = JSON.parse(raw);
    const eventId = event.id;
    const db = await getDatabase();
    
    // Idempotency check
    const existing = await db.collection('webhookEvents').findOne({ eventId });
    if (existing) {
      return NextResponse.json({ received: true });
    }
    
    // Store webhook event
    await db.collection('webhookEvents').insertOne({
      eventId,
      event: event.event,
      payload: event.payload,
      receivedAt: new Date().toISOString()
    });
    
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    
    if (!orderId) {
      return NextResponse.json({ received: true });
    }
    
    const booking = await db.collection('bookings').findOne({ razorpayOrderId: orderId });
    if (!booking) {
      console.error('No booking found for order:', orderId);
      return NextResponse.json({ received: true });
    }
    
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paidAmountPaise = payment.amount || 0;
      const paidAmountRupees = paidAmountPaise / 100;
      
      await db.collection('bookings').updateOne(
        { razorpayOrderId: orderId },
        { $set: {
          paymentStatus: paidAmountRupees >= booking.totalAmount ? 'paid' : 'partial',
          amountPaid: paidAmountRupees,
          razorpayPaymentId: payment.id,
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
      );
    } else if (event.event === 'payment.failed') {
      await db.collection('bookings').updateOne(
        { razorpayOrderId: orderId },
        { $set: {
          paymentStatus: 'failed',
          status: 'failed',
          updatedAt: new Date().toISOString(),
        }}
      );
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
