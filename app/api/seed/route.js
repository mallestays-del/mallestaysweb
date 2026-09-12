import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  
  try {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'mallestays';
    
    if (!mongoUrl) {
      return NextResponse.json({ success: false, error: 'MONGO_URL not set' }, { status: 500 });
    }

    const isLocal = mongoUrl.includes('localhost') || mongoUrl.includes('127.0.0.1');
    const options = isLocal ? { maxPoolSize: 5 } : { maxPoolSize: 5, tls: true };

    client = new MongoClient(mongoUrl, options);
    await client.connect();
    const db = client.db(dbName);
    const admins = db.collection('admins');
    const results = [];

    const existingAdmin = await admins.findOne({ email: 'admin@mallestays.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await admins.insertOne({ id: uuidv4(), email: 'admin@mallestays.com', password: hashedPassword, name: 'Super Admin', role: 'super_admin', createdAt: new Date().toISOString() });
      results.push('Super Admin created');
    } else {
      results.push('Super Admin exists');
    }

    const existingSub = await admins.findOne({ email: 'subadmin@mallestays.com' });
    if (!existingSub) {
      const hashedPassword = await bcrypt.hash('subadmin123', 12);
      await admins.insertOne({ id: uuidv4(), email: 'subadmin@mallestays.com', password: hashedPassword, name: 'Sub Admin', role: 'sub_admin', createdAt: new Date().toISOString() });
      results.push('Sub Admin created');
    } else {
      results.push('Sub Admin exists');
    }

    await client.close();
    return NextResponse.json({ success: true, message: 'Database seeded!', results });
  } catch (error) {
    if (client) try { await client.close(); } catch (e) {}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
