import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET all offers
export async function GET() {
  try {
    const db = await getDatabase();
    const offers = await db.collection('offers')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new offer
export async function POST(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    
    const offer = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('offers').insertOne(offer);
    
    return NextResponse.json({ message: 'Offer created', offer });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
