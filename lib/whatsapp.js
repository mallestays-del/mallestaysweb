import { toE164 } from './phone';

// Low-level WhatsApp Cloud API helper (Meta Graph API).
// Keeps the permanent access token on the server. Never import in a client component.

const API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v21.0';

function endpoint() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) throw new Error('WHATSAPP_PHONE_NUMBER_ID is not set');
  return `https://graph.facebook.com/${API_VERSION}/${phoneId}/messages`;
}

async function send(payload) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN is not set');

  const res = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data?.error?.message || `WhatsApp HTTP ${res.status}`;
    const errCode = data?.error?.code;
    const errSubcode = data?.error?.error_subcode;
    console.error('[whatsapp] send failed', { status: res.status, errMsg, errCode, errSubcode });
    const err = new Error(errMsg);
    err.code = errCode;
    err.subcode = errSubcode;
    err.status = res.status;
    throw err;
  }
  return data; // { messaging_product, contacts:[], messages:[{id}] }
}

export function sendText(to, body, previewUrl = false) {
  return send({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toE164(to),
    type: 'text',
    text: { preview_url: previewUrl, body },
  });
}

export function sendTemplate(to, name, languageCode = 'en_US', components = []) {
  return send({
    messaging_product: 'whatsapp',
    to: toE164(to),
    type: 'template',
    template: { name, language: { code: languageCode }, components },
  });
}

export function sendTemplateBody(to, name, values, languageCode = 'en_US') {
  return sendTemplate(to, name, languageCode, [
    {
      type: 'body',
      parameters: values.map((text) => ({ type: 'text', text: String(text) })),
    },
  ]);
}

export function sendTemplateWithUrlButton(to, name, bodyValues, urlSuffix, languageCode = 'en_US', buttonIndex = '0') {
  return sendTemplate(to, name, languageCode, [
    {
      type: 'body',
      parameters: bodyValues.map((text) => ({ type: 'text', text: String(text) })),
    },
    {
      type: 'button',
      sub_type: 'url',
      index: buttonIndex,
      parameters: [{ type: 'text', text: encodeURIComponent(String(urlSuffix)) }],
    },
  ]);
}

export function isConfigured() {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
