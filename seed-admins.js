const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'malle_stays';

async function seedAdmins() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const admins = db.collection('admins');
    
    // Check if admin already exists
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
      console.log('✅ Super Admin created: admin@mallestays.com / admin123');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }
    
    // Check if sub-admin already exists
    const existingSubAdmin = await admins.findOne({ email: 'subadmin@mallestays.com' });
    
    if (!existingSubAdmin) {
      const hashedPassword = await bcrypt.hash('subadmin123', 12);
      await admins.insertOne({
        id: uuidv4(),
        email: 'subadmin@mallestays.com',
        password: hashedPassword,
        name: 'Sub Admin',
        role: 'admin',  // Changed from sub_admin to admin for delete permissions
        createdAt: new Date().toISOString()
      });
      console.log('✅ Sub Admin created: subadmin@mallestays.com / subadmin123');
    } else {
      console.log('ℹ️  Sub Admin already exists');
    }
    
    // Verify admins
    const allAdmins = await admins.find({}).project({ password: 0 }).toArray();
    console.log('\n📋 All Admins in Database:');
    console.log(JSON.stringify(allAdmins, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Done!');
  }
}

seedAdmins();
