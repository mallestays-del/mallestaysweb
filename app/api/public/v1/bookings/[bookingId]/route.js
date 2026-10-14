import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/public/v1/bookings/[bookingId]
// Auth: Authorization: Bearer <PUBLIC_API_KEY>
export async function GET(request, { params }) {
  const auth = requireApiKey(request);
  if (!auth.ok) return auth.response;

  try {
    const db = await getDatabase();
    const booking = await db
      .collection('bookings')
      .findOne({ bookingId: params.bookingId }, { projection: { _id: 0 } });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
