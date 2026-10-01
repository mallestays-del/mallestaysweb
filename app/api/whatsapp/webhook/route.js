import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — webhook verification handshake from Meta
export async function GET(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge || '', { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// POST — delivery status callbacks (sent/delivered/read/failed) and incoming replies
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ ok: true });
    }

    const db = await getDatabase();
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        // Status updates
        for (const s of value.statuses || []) {
          await db.collection('whatsapp_message_logs').updateOne(
            { messageId: s.id },
            {
              $set: {
                messageId: s.id,
                status: s.status,
                recipientId: s.recipient_id,
                timestamp: s.timestamp,
                conversationId: s.conversation?.id,
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
        }
        // Inbound messages
        for (const m of value.messages || []) {
          await db.collection('whatsapp_inbound').insertOne({
            messageId: m.id,
            from: m.from,
            type: m.type,
            text: m.text?.body || null,
            timestamp: m.timestamp,
            raw: m,
            receivedAt: new Date(),
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[whatsapp webhook] error', err);
    return NextResponse.json({ ok: true });
  }
}
