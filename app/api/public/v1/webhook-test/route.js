import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { deliverWebhook } from '@/lib/webhook-signer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/public/v1/webhook-test
// Auth: Authorization: Bearer <PUBLIC_API_KEY>
// Optional body: { url?: 'https://your-app.example/webhook' }  (defaults to BOOKING_WEBHOOK_URL env)
// Sends a signed sample booking.confirmed payload to help you verify your receiver.
export async function POST(request) {
  const auth = requireApiKey(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => ({}));
  const targetUrl = body?.url || process.env.BOOKING_WEBHOOK_URL;
  if (!targetUrl) {
    return NextResponse.json(
      { error: 'No webhook URL. Provide { url } in body or set BOOKING_WEBHOOK_URL in env.' },
      { status: 400 }
    );
  }

  const samplePayload = {
    bookingId: 'MS-TEST-' + Date.now().toString(36).toUpperCase(),
    villaId: 'serenity-palms',
    villaName: 'Serenity Palms Villa',
    villaLocation: 'Alibaug, Maharashtra',
    checkIn: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    nights: 3,
    guests: 4,
    guestName: 'Sample Guest',
    guestEmail: 'sample@example.com',
    guestPhone: '+918446620191',
    amountPaid: 25000,
    totalAmount: 125000,
    currency: 'INR',
    status: 'confirmed',
    paymentStatus: 'partial',
    paymentId: 'pay_sample_abc123',
    createdAt: new Date().toISOString(),
  };

  const result = await deliverWebhook('booking.confirmed', samplePayload, targetUrl);
  return NextResponse.json({ sent: true, targetUrl, result, payload: samplePayload });
}
