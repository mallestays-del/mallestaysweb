// High-level WhatsApp notification orchestration for Malle Stays bookings.
// Builds domain-specific messages, enforces idempotency, logs sends to MongoDB.

import { sendText, sendTemplateBody, sendTemplateWithUrlButton, isConfigured } from './whatsapp';
import { getDatabase } from './mongodb';
import { tryE164 } from './phone';

const USE_TEMPLATES = String(process.env.WHATSAPP_TEMPLATES_APPROVED || 'false').toLowerCase() === 'true';
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

// Format YYYY-MM-DD → human readable (e.g. 'Mon, 15 Oct 2026')
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtAmount(amount) {
  if (amount == null || isNaN(Number(amount))) return '';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function firstName(fullName) {
  if (!fullName) return 'Guest';
  return String(fullName).trim().split(/\s+/)[0];
}

/**
 * Idempotent sender wrapper. Uses a MongoDB collection to ensure the same
 * (bookingId, notificationType) is never sent twice.
 */
async function sendOnce({ bookingId, type, recipient, action }) {
  if (!isConfigured()) {
    console.warn('[whatsapp] not configured, skipping', { bookingId, type });
    return { skipped: true, reason: 'not_configured' };
  }
  if (!recipient) {
    console.warn('[whatsapp] no recipient, skipping', { bookingId, type });
    return { skipped: true, reason: 'no_recipient' };
  }

  const db = await getDatabase();
  const col = db.collection('whatsapp_notifications');
  const key = `${bookingId}:${type}`;

  // Claim the key atomically (upsert, only insert succeeds first time)
  const claim = await col.updateOne(
    { key },
    { $setOnInsert: { key, bookingId, type, recipient, status: 'queued', createdAt: new Date() } },
    { upsert: true }
  );

  if (!claim.upsertedCount) {
    // Already attempted; look up and return existing record
    const existing = await col.findOne({ key });
    return { skipped: true, reason: 'already_sent', record: existing };
  }

  try {
    const result = await action();
    const messageId = result?.messages?.[0]?.id || null;
    await col.updateOne({ key }, { $set: { status: 'accepted', messageId, response: result, updatedAt: new Date() } });
    return { sent: true, messageId, result };
  } catch (err) {
    await col.updateOne(
      { key },
      {
        $set: {
          status: 'failed',
          errorMessage: err?.message || String(err),
          errorCode: err?.code || null,
          updatedAt: new Date(),
        },
      }
    );
    console.error('[whatsapp] send failed', { bookingId, type, err: err?.message });
    return { failed: true, error: err?.message };
  }
}

// -----------------------------------------------------------------------------
// Public notification functions
// -----------------------------------------------------------------------------

/** 1. Guest booking confirmation (sent after successful payment) */
export async function sendBookingConfirmation(booking) {
  const guestPhone = tryE164(booking.guestPhone);
  if (!guestPhone) {
    console.warn('[whatsapp] invalid guest phone, skipping confirmation', booking.bookingId);
    return { skipped: true, reason: 'invalid_phone' };
  }

  const name = firstName(booking.guestName);
  const villa = booking.villaName || 'your villa';
  const checkIn = fmtDate(booking.checkIn);
  const checkOut = fmtDate(booking.checkOut);
  const nights = booking.nights || 1;
  const guests = booking.guests || 1;
  const amountPaid = fmtAmount(booking.amountPaid);
  const total = fmtAmount(booking.totalAmount);
  const balance = Math.max(0, Number(booking.totalAmount || 0) - Number(booking.amountPaid || 0));
  const location = booking.villaLocation || '';
  const bookingLink = `${BASE_URL}/booking/${booking.bookingId}`;

  const freeFormBody =
    `✨ *Booking Confirmed — Malle Stays™*\n\n` +
    `Hi ${name}, your luxury stay is all set!\n\n` +
    `📋 *Booking:* ${booking.bookingId}\n` +
    `🏡 *Villa:* ${villa}${location ? `\n📍 *Location:* ${location}` : ''}\n` +
    `📅 *Check-in:* ${checkIn}\n` +
    `📅 *Check-out:* ${checkOut}\n` +
    `🌙 *Nights:* ${nights}  |  👥 *Guests:* ${guests}\n\n` +
    `💳 *Paid:* ${amountPaid}\n` +
    `💰 *Total:* ${total}` +
    (balance > 0 ? `\n⚠️ *Balance due at check-in:* ${fmtAmount(balance)}` : '') +
    `\n\n` +
    `📱 Need help? Reply to this message or email us anytime.\n` +
    `🔗 View booking: ${bookingLink}\n\n` +
    `Thank you for choosing Malle Stays — we can't wait to host you! 🌴`;

  return sendOnce({
    bookingId: booking.bookingId,
    type: 'booking_confirmation',
    recipient: guestPhone,
    action: () =>
      USE_TEMPLATES
        ? sendTemplateBody(guestPhone, 'booking_confirmation', [name, booking.bookingId, villa, checkIn, checkOut, amountPaid])
        : sendText(guestPhone, freeFormBody, true),
  });
}

/** 2. Admin alert on new booking */
export async function sendAdminAlert(booking) {
  const admin = tryE164(ADMIN_NUMBER);
  if (!admin) return { skipped: true, reason: 'no_admin_number' };

  const freeFormBody =
    `🔔 *New Booking Received*\n\n` +
    `📋 ${booking.bookingId}\n` +
    `🏡 ${booking.villaName || booking.villaId}\n` +
    `👤 ${booking.guestName} (${booking.guestPhone})\n` +
    `📧 ${booking.guestEmail || 'n/a'}\n\n` +
    `📅 ${fmtDate(booking.checkIn)} → ${fmtDate(booking.checkOut)}\n` +
    `🌙 ${booking.nights} nights  |  👥 ${booking.guests} guests\n\n` +
    `💳 Paid: ${fmtAmount(booking.amountPaid)} / ${fmtAmount(booking.totalAmount)}\n` +
    `🔗 Admin: ${BASE_URL}/admin/bookings`;

  return sendOnce({
    bookingId: booking.bookingId,
    type: 'admin_alert',
    recipient: admin,
    action: () =>
      USE_TEMPLATES
        ? sendTemplateBody(admin, 'new_booking_admin_alert', [
            booking.bookingId,
            booking.guestName || 'Guest',
            booking.villaName || booking.villaId,
            fmtDate(booking.checkIn),
            fmtDate(booking.checkOut),
            fmtAmount(booking.totalAmount),
          ])
        : sendText(admin, freeFormBody, true),
  });
}

/** 3. Check-in reminder (sent ~24h before check-in) */
export async function sendCheckinReminder(booking) {
  const guestPhone = tryE164(booking.guestPhone);
  if (!guestPhone) return { skipped: true, reason: 'invalid_phone' };

  const name = firstName(booking.guestName);
  const villa = booking.villaName || 'your villa';
  const checkIn = fmtDate(booking.checkIn);
  const location = booking.villaLocation || '';

  const freeFormBody =
    `🌴 *Check-in Reminder — Malle Stays™*\n\n` +
    `Hi ${name}, your luxury stay begins tomorrow! ✨\n\n` +
    `🏡 *Villa:* ${villa}${location ? `\n📍 *Location:* ${location}` : ''}\n` +
    `📅 *Check-in:* ${checkIn}\n` +
    `📋 *Booking:* ${booking.bookingId}\n\n` +
    `⏰ *Check-in time:* 2:00 PM onwards\n` +
    `📞 Need directions or early check-in? Reply here anytime.\n\n` +
    `Safe travels — see you soon! 🧳`;

  return sendOnce({
    bookingId: booking.bookingId,
    type: 'checkin_reminder',
    recipient: guestPhone,
    action: () =>
      USE_TEMPLATES
        ? sendTemplateBody(guestPhone, 'checkin_reminder', [name, booking.bookingId, checkIn, villa])
        : sendText(guestPhone, freeFormBody, true),
  });
}

/** 4. Abandoned-cart / payment-failed recovery */
export async function sendPaymentRecovery(booking) {
  const guestPhone = tryE164(booking.guestPhone);
  if (!guestPhone) return { skipped: true, reason: 'invalid_phone' };

  const name = firstName(booking.guestName);
  const villa = booking.villaName || 'your villa';
  const retryUrl = `${BASE_URL}/checkout?bookingId=${booking.bookingId}`;

  const freeFormBody =
    `👋 *Hi ${name}, your dream stay is almost yours!*\n\n` +
    `We noticed you started booking *${villa}* but didn't complete payment.\n\n` +
    `📅 ${fmtDate(booking.checkIn)} → ${fmtDate(booking.checkOut)}\n` +
    `💰 ${fmtAmount(booking.totalAmount)}\n\n` +
    `✨ Your villa is still available — complete your booking now before someone else grabs it!\n\n` +
    `🔗 ${retryUrl}\n\n` +
    `Need help? Just reply to this message. — Malle Stays™`;

  return sendOnce({
    bookingId: booking.bookingId,
    type: 'payment_recovery',
    recipient: guestPhone,
    action: () =>
      USE_TEMPLATES
        ? sendTemplateWithUrlButton(
            guestPhone,
            'payment_failed_recovery',
            [name, villa, fmtAmount(booking.totalAmount)],
            booking.bookingId
          )
        : sendText(guestPhone, freeFormBody, true),
  });
}
