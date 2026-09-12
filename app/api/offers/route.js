import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET active public offers
export async function GET() {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString().split('T')[0];
    
    const offers = await db.collection('offers')
      .find({
        isActive: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
