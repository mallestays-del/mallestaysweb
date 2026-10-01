import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { sendPaymentRecovery } from '@/lib/whatsapp-notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cron endpoints must ack 2xx immediately; enqueue/background the actual work.

function constantTimeEq(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function processAbandoned(runId) {
  try {
    const db = await getDatabase();
    const now = new Date();
    const windowStart = new Date(now.getTime() - 180 * 60 * 1000).toISOString(); // 3h ago
    const windowEnd = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30m ago

    const bookings = await db
      .collection('bookings')
      .find({
        status: 'pending',
        paymentStatus: { $in: ['pending', null] },
        createdAt: { $gte: windowStart, $lte: windowEnd },
      })
      .limit(50)
      .toArray();

    console.log(`[cron:abandoned-cart] runId=${runId} window=${windowStart}..${windowEnd} found=${bookings.length}`);
    for (const b of bookings) {
      try {
        const r = await sendPaymentRecovery(b);
        console.log(`[cron:abandoned-cart] booking=${b.bookingId}`, r);
      } catch (e) {
        console.error(`[cron:abandoned-cart] booking=${b.bookingId} failed`, e?.message);
      }
    }
  } catch (err) {
    console.error(`[cron:abandoned-cart] runId=${runId} fatal`, err?.message);
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

  processAbandoned(runId);

  return NextResponse.json({ ok: true, runId, acceptedAt: new Date().toISOString() });
}

export async function GET(request) {
  return handle(request);
}
export async function POST(request) {
  return handle(request);
}
