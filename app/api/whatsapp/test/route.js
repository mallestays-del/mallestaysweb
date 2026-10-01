import { NextResponse } from 'next/server';
import { sendTemplate, sendText } from '@/lib/whatsapp';
import { toE164 } from '@/lib/phone';
import { sendBookingConfirmation, sendAdminAlert, sendCheckinReminder, sendPaymentRecovery } from '@/lib/whatsapp-notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/whatsapp/test
// Headers: x-internal-key: <INTERNAL_API_KEY>
// Body modes:
//   { to, mode: 'template' }                         → sends hello_world template (default)
//   { to, mode: 'text', text: '...' }                → sends free-form text
//   { mode: 'simulate', scenario: 'confirmation'    → fires sendBookingConfirmation+sendAdminAlert against a fake booking
//                     | 'checkin' | 'recovery',
//     to? (overrides guestPhone) }
export async function POST(request) {
  try {
    const providedKey = request.headers.get('x-internal-key');
    if (!providedKey || providedKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body?.mode || 'template';

    if (mode === 'simulate') {
      const scenario = body?.scenario || 'confirmation';
      const phone = body?.to || process.env.ADMIN_WHATSAPP_NUMBER;
      const booking = {
        bookingId: 'MS-TEST-' + Date.now().toString(36).toUpperCase(),
        villaId: 'test-villa',
        villaName: 'Serenity Palms Villa',
        villaLocation: 'Alibaug, Maharashtra',
        villaSlug: 'serenity-palms',
        checkIn: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        nights: 3,
        guests: 4,
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: phone,
        amountPaid: 25000,
        totalAmount: 125000,
        status: 'confirmed',
        paymentStatus: 'partial',
      };
      let result;
      if (scenario === 'confirmation') {
        const [g, a] = await Promise.all([sendBookingConfirmation(booking), sendAdminAlert(booking)]);
        result = { guest: g, admin: a };
      } else if (scenario === 'checkin') {
        result = await sendCheckinReminder(booking);
      } else if (scenario === 'recovery') {
        result = await sendPaymentRecovery({ ...booking, status: 'pending', paymentStatus: 'pending' });
      } else {
        return NextResponse.json({ error: 'Unknown scenario' }, { status: 400 });
      }
      return NextResponse.json({ success: true, scenario, bookingId: booking.bookingId, result });
    }

    const to = body?.to;
    if (!to) return NextResponse.json({ error: 'Missing `to` phone number' }, { status: 400 });
    const phone = toE164(to);

    let result;
    if (mode === 'text') {
      const text = body?.text || '✅ Hello from Malle Stays! Your WhatsApp integration is live.';
      result = await sendText(phone, text, false);
    } else {
      result = await sendTemplate(phone, 'hello_world', 'en_US');
    }

    return NextResponse.json({ success: true, mode, to: phone, result });
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Send failed', code: err?.code, status: err?.status }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp test endpoint — POST with x-internal-key header and {to, mode?, text?} body',
    configured: !!process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_GRAPH_API_VERSION,
    templatesApproved: process.env.WHATSAPP_TEMPLATES_APPROVED,
    adminNumber: process.env.ADMIN_WHATSAPP_NUMBER,
  });
}
