// Webhook delivery with HMAC-SHA256 signatures.
// Signs the exact request body (bytes) with BOOKING_WEBHOOK_SECRET and sends
// it in the X-Malle-Signature header as `sha256=<hex>`. Receivers should
// recompute HMAC-SHA256(secret, raw_body) and compare in constant time.

import crypto from 'crypto';
import { getDatabase } from './mongodb';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 5000]; // between attempts 1-2 and 2-3

export function signPayload(bodyString, secret = process.env.BOOKING_WEBHOOK_SECRET || '') {
  if (!secret) return '';
  return 'sha256=' + crypto.createHmac('sha256', secret).update(bodyString, 'utf8').digest('hex');
}

export function verifySignature(bodyString, signatureHeader, secret = process.env.BOOKING_WEBHOOK_SECRET || '') {
  if (!secret || !signatureHeader) return false;
  const expected = signPayload(bodyString, secret);
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function logDelivery(doc) {
  try {
    const db = await getDatabase();
    await db.collection('webhook_deliveries').insertOne({ ...doc, createdAt: new Date() });
  } catch (e) {
    console.error('[webhook] log failed', e?.message);
  }
}

/**
 * Deliver a signed JSON POST to `url` with retries. Fire-and-forget safe.
 * @param {string} eventType e.g. 'booking.confirmed'
 * @param {object} payload any JSON-serializable object
 */
export async function deliverWebhook(eventType, payload, url = process.env.BOOKING_WEBHOOK_URL) {
  if (!url) {
    console.log('[webhook] BOOKING_WEBHOOK_URL not set, skipping', eventType);
    return { skipped: true, reason: 'no_url' };
  }

  const envelope = {
    event: eventType,
    deliveryId: crypto.randomUUID(),
    sentAt: new Date().toISOString(),
    data: payload,
  };
  const bodyString = JSON.stringify(envelope);
  const signature = signPayload(bodyString);

  let lastError = null;
  let lastStatus = null;
  let lastResponse = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MalleStays-Webhooks/1.0',
          'X-Malle-Event': eventType,
          'X-Malle-Delivery': envelope.deliveryId,
          'X-Malle-Signature': signature,
        },
        body: bodyString,
        // 15s hard cap per attempt
        signal: AbortSignal.timeout(15000),
      });
      lastStatus = res.status;
      lastResponse = (await res.text().catch(() => '')).slice(0, 500);
      if (res.ok) {
        await logDelivery({
          event: eventType,
          deliveryId: envelope.deliveryId,
          url,
          attempt,
          status: res.status,
          success: true,
          responseSnippet: lastResponse,
        });
        return { success: true, deliveryId: envelope.deliveryId, status: res.status, attempt };
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err?.message || String(err);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    }
  }

  await logDelivery({
    event: eventType,
    deliveryId: envelope.deliveryId,
    url,
    attempts: MAX_ATTEMPTS,
    status: lastStatus,
    success: false,
    errorMessage: lastError,
    responseSnippet: lastResponse,
  });
  console.error('[webhook] delivery failed after', MAX_ATTEMPTS, 'attempts:', lastError);
  return { success: false, deliveryId: envelope.deliveryId, error: lastError };
}
