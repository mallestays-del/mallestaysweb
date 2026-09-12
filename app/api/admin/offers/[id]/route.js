import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// PUT update offer
export async function PUT(request, { params }) {
  try {
    const db = await getDatabase();
    const { id } = params;
    const body = await request.json();
    
    await db.collection('offers').updateOne(
      { id },
      { 
        $set: {
          ...body,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    return NextResponse.json({ message: 'Offer updated' });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE offer
export async function DELETE(request, { params }) {
  try {
    const db = await getDatabase();
    const { id } = params;
    
    await db.collection('offers').deleteOne({ id });
    
    return NextResponse.json({ message: 'Offer deleted' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
