import { Resend } from 'resend';

// Lazy singleton — do NOT throw at module import time, otherwise
// `next build` (which imports every route module to collect page data)
// will fail on hosts where RESEND_API_KEY has not yet been configured.
// The error is deferred to actual send-time instead.

let _client = null;

function getClient() {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('Missing RESEND_API_KEY — set it in your environment to send emails');
  }
  _client = new Resend(key);
  return _client;
}

// Proxy exposes the same `resend.emails.send(...)` surface as the real client.
// Any property access lazily initializes the real Resend client. If RESEND_API_KEY
// is missing at call time, we throw a clear error there — not at build time.
export const resend = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getClient();
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);

export const fromAddress =
  process.env.RESEND_FROM ?? 'Malle Stays <onboarding@resend.dev>';

export function isResendConfigured() {
  return !!process.env.RESEND_API_KEY;
}
