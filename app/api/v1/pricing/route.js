import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET /api/v1/pricing?villaId=xxx&checkIn=2026-05-10&checkOut=2026-05-12&guests=6
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const villaId = searchParams.get('villaId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests') || '2');
    
    if (!villaId || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'villaId, checkIn, and checkOut are required' }, { status: 400 });
    }
    
    const db = await getDatabase();
    const villa = await db.collection('villas').findOne({ 
      $or: [{ id: villaId }, { slug: villaId }] 
    });
    
    if (!villa) {
      return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
    }
    
    // Get pricing config for this villa
    let pricing = await db.collection('pricing').findOne({ villaId: villa.id || villa.slug });
    
    // Default pricing if not configured
    if (!pricing) {
      pricing = {
        weekdayRate: villa.pricePerNight || 5000,
        weekendRate: Math.round((villa.pricePerNight || 5000) * 1.3),
        maxGuestsIncluded: villa.maxGuests || 6,
        extraGuestCharge: 500,
        cleaningFee: 1000,
        securityDeposit: 2000,
        gstPercent: 12,
      };
    }
    
    // Calculate night-by-night pricing
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = [];
    let totalBase = 0;
    
    let current = new Date(start);
    while (current < end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri, Sat
      const rate = isWeekend ? pricing.weekendRate : pricing.weekdayRate;
      
      nights.push({
        date: current.toISOString().split('T')[0],
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        isWeekend,
        rate
      });
      totalBase += rate;
      current.setDate(current.getDate() + 1);
    }
    
    // Extra guest charges
    const extraGuests = Math.max(0, guests - (pricing.maxGuestsIncluded || 6));
    const extraGuestTotal = extraGuests * (pricing.extraGuestCharge || 500) * nights.length;
    
    // Subtotal
    const subtotal = totalBase + extraGuestTotal;
    
    // GST
    const gstAmount = Math.round(subtotal * (pricing.gstPercent || 12) / 100);
    
    // Cleaning fee
    const cleaningFee = pricing.cleaningFee || 0;
    
    // Security deposit (refundable)
    const securityDeposit = pricing.securityDeposit || 0;
    
    // Total
    const totalAmount = subtotal + gstAmount + cleaningFee;
    const grandTotal = totalAmount + securityDeposit;
    
    // Advance amount (20%)
    const advanceAmount = Math.ceil(totalAmount * 0.2);
    
    const result = {
      villa: { name: villa.name, slug: villa.slug, location: villa.location },
      checkIn,
      checkOut,
      guests,
      nightCount: nights.length,
      nights,
      breakdown: {
        baseTotal: totalBase,
        extraGuests,
        extraGuestCharge: pricing.extraGuestCharge || 500,
        extraGuestTotal,
        subtotal,
        gstPercent: pricing.gstPercent || 12,
        gstAmount,
        cleaningFee,
        totalAmount,
        securityDeposit,
        grandTotal,
        advanceAmount,
      },
      pricing: {
        weekdayRate: pricing.weekdayRate,
        weekendRate: pricing.weekendRate,
        maxGuestsIncluded: pricing.maxGuestsIncluded,
      }
    };
    
    const res = NextResponse.json(result);
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (error) {
    console.error('Pricing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/v1/pricing - Update pricing config (admin)
export async function POST(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { villaId, weekdayRate, weekendRate, maxGuestsIncluded, extraGuestCharge, cleaningFee, securityDeposit, gstPercent } = body;
    
    if (!villaId) {
      return NextResponse.json({ error: 'villaId is required' }, { status: 400 });
    }
    
    await db.collection('pricing').updateOne(
      { villaId },
      { $set: {
        villaId,
        weekdayRate: weekdayRate || 5000,
        weekendRate: weekendRate || 6500,
        maxGuestsIncluded: maxGuestsIncluded || 6,
        extraGuestCharge: extraGuestCharge || 500,
        cleaningFee: cleaningFee || 1000,
        securityDeposit: securityDeposit || 2000,
        gstPercent: gstPercent || 12,
        updatedAt: new Date().toISOString()
      }},
      { upsert: true }
    );
    
    return NextResponse.json({ message: 'Pricing updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
