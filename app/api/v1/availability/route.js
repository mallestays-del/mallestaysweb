import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET /api/v1/availability?villaId=xxx&month=2026-05
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get('villaId');
    const month = searchParams.get('month'); // YYYY-MM format
    
    if (!villaId) {
      return NextResponse.json({ error: 'villaId is required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    let query = { villaId };
    if (month) {
      const [year, mon] = month.split('-');
      const startDate = `${year}-${mon}-01`;
      const endDate = `${year}-${String(parseInt(mon) + 1).padStart(2, '0')}-01`;
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const blockedDates = await db.collection('availability').find(query).toArray();
    
    // Also get bookings for this villa
    const bookings = await db.collection('bookings').find({
      villaId,
      status: { $in: ['confirmed', 'pending'] }
    }).toArray();
    
    // Collect all booked dates
    const bookedDates = [];
    bookings.forEach(booking => {
      let current = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      while (current < end) {
        bookedDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    
    const res = NextResponse.json({ 
      blockedDates: blockedDates.map(d => d.date),
      bookedDates,
      allUnavailable: [...new Set([...blockedDates.map(d => d.date), ...bookedDates])]
    });
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/v1/availability - Block/unblock dates (admin only)
export async function POST(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { villaId, dates, action, reason } = body;
    
    if (!villaId || !dates || !action) {
      return NextResponse.json({ error: 'villaId, dates, and action are required' }, { status: 400 });
    }
    
    if (action === 'block') {
      const docs = dates.map(date => ({
        villaId,
        date,
        reason: reason || 'manual_block',
        blockedAt: new Date().toISOString()
      }));
      
      // Upsert to avoid duplicates
      for (const doc of docs) {
        await db.collection('availability').updateOne(
          { villaId: doc.villaId, date: doc.date },
          { $set: doc },
          { upsert: true }
        );
      }
      return NextResponse.json({ message: `${dates.length} dates blocked` });
    } else if (action === 'unblock') {
      await db.collection('availability').deleteMany({
        villaId,
        date: { $in: dates }
      });
      return NextResponse.json({ message: `${dates.length} dates unblocked` });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
