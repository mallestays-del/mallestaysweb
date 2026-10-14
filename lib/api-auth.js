// Public API authentication (Bearer token)
// Usage in route handler:
//   const auth = requireApiKey(request);
//   if (!auth.ok) return auth.response;

import { NextResponse } from 'next/server';

function constantTimeEq(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function requireApiKey(request) {
  const expected = process.env.PUBLIC_API_KEY || '';
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'PUBLIC_API_KEY is not configured on the server' },
        { status: 500 }
      ),
    };
  }

  const header = request.headers.get('authorization') || '';
  const bearer = header.replace(/^Bearer\s+/i, '').trim();
  const altHeader = request.headers.get('x-api-key') || '';
  const token = bearer || altHeader;

  if (!token || !constantTimeEq(token, expected)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized — invalid or missing API key' }, { status: 401 }),
    };
  }

  return { ok: true };
}
