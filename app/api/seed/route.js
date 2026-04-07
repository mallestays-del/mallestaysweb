import { NextResponse } from 'next/server';
import { createDefaultAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await createDefaultAdmin();
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully! Admin accounts created.',
      accounts: [
        { email: 'admin@mallestays.com', password: 'admin123', role: 'super_admin' },
        { email: 'subadmin@mallestays.com', password: 'subadmin123', role: 'sub_admin' }
      ]
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
