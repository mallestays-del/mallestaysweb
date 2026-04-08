import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  let client;
  
  try {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'mallestays';
    
    if (!mongoUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'MONGO_URL environment variable is not set' 
      }, { status: 500 });
    }

    // Connect directly to avoid any caching issues
    client = new MongoClient(mongoUrl, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    
    await client.connect();
    const db = client.db(dbName);
    const admins = db.collection('admins');

    const results = [];

    // Create super admin
    const existingAdmin = await admins.findOne({ email: 'admin@mallestays.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await admins.insertOne({
        id: uuidv4(),
        email: 'admin@mallestays.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      });
      results.push('Super Admin created: admin@mallestays.com');
    } else {
      results.push('Super Admin already exists: admin@mallestays.com');
    }

    // Create sub admin
    const existingSubAdmin = await admins.findOne({ email: 'subadmin@mallestays.com' });
    if (!existingSubAdmin) {
      const hashedPassword = await bcrypt.hash('subadmin123', 12);
      await admins.insertOne({
        id: uuidv4(),
        email: 'subadmin@mallestays.com',
        password: hashedPassword,
        name: 'Sub Admin',
        role: 'sub_admin',
        createdAt: new Date().toISOString()
      });
      results.push('Sub Admin created: subadmin@mallestays.com');
    } else {
      results.push('Sub Admin already exists: subadmin@mallestays.com');
    }

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      results,
      accounts: [
        { email: 'admin@mallestays.com', password: 'admin123', role: 'super_admin' },
        { email: 'subadmin@mallestays.com', password: 'subadmin123', role: 'sub_admin' }
      ]
    });
  } catch (error) {
    console.error('Seed error:', error);
    if (client) {
      try { await client.close(); } catch (e) {}
    }
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: 'Check if MONGO_URL environment variable is correctly set in Vercel and MongoDB Atlas allows connections from all IPs (0.0.0.0/0)'
    }, { status: 500 });
  }
}
