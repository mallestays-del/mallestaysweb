import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendCheckinReminder } from '@/lib/whatsapp-notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cron endpoints must ack 2xx immediately; enqueue/background the actual work.

function constantTimeEq(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function processReminders(runId) {
  try {
    const db = await getDatabase();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    const bookings = await db
      .collection('bookings')
      .find({
        status: 'confirmed',
        $or: [
          { checkIn: tomorrowISO },
          { checkIn: { $gte: tomorrowISO + 'T00:00:00', $lt: tomorrowISO + 'T23:59:59' } },
        ],
      })
      .limit(100)
      .toArray();

    console.log(`[cron:checkin-reminders] runId=${runId} tomorrow=${tomorrowISO} found=${bookings.length}`);
    for (const b of bookings) {
      try {
        const r = await sendCheckinReminder(b);
        console.log(`[cron:checkin-reminders] booking=${b.bookingId}`, r);
      } catch (e) {
        console.error(`[cron:checkin-reminders] booking=${b.bookingId} failed`, e?.message);
      }
    }
  } catch (err) {
    console.error(`[cron:checkin-reminders] runId=${runId} fatal`, err?.message);
  }
}

async function handle(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const alt = request.headers.get('x-cron-key') || new URL(request.url).searchParams.get('key') || '';
  const secret = process.env.WEBHOOK_CRON_SECRET || '';
  if (!secret || (!constantTimeEq(token, secret) && !constantTimeEq(alt, secret))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const runId = request.headers.get('x-webhook-id') || `manual-${Date.now()}`;

  // Fire & forget: queue work, respond 2xx immediately.
  processReminders(runId);

  return NextResponse.json({ ok: true, runId, acceptedAt: new Date().toISOString() });
}

export async function GET(request) {
  return handle(request);
}
export async function POST(request) {
  return handle(request);
}
