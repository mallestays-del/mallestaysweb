import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/public/v1/bookings
// Auth: Authorization: Bearer <PUBLIC_API_KEY>   (or header x-api-key)
// Query params (all optional):
//   status       — pending | confirmed | cancelled
//   from         — ISO date YYYY-MM-DD (filters checkIn >= from)
//   to           — ISO date YYYY-MM-DD (filters checkIn <= to)
//   villaId      — filter by villa id
//   limit        — 1..100 (default 50)
//   cursor       — ISO timestamp from previous page's `nextCursor` (keyset pagination on createdAt desc)
export async function GET(request) {
  const auth = requireApiKey(request);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const q = Object.fromEntries(url.searchParams);
    const filter = {};

    if (q.status) filter.status = q.status;
    if (q.villaId) filter.villaId = q.villaId;
    if (q.from || q.to) {
      filter.checkIn = {};
      if (q.from) filter.checkIn.$gte = q.from;
      if (q.to) filter.checkIn.$lte = q.to;
    }
    if (q.cursor) {
      filter.createdAt = { $lt: q.cursor };
    }

    const limit = Math.min(100, Math.max(1, parseInt(q.limit || '50', 10) || 50));
    const db = await getDatabase();
    const docs = await db
      .collection('bookings')
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore ? page[page.length - 1].createdAt : null;

    return NextResponse.json({
      count: page.length,
      hasMore,
      nextCursor,
      bookings: page,
    });
  } catch (err) {
    console.error('[public bookings] error', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
