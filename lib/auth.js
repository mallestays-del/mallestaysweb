import { getDatabase } from './mongodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createDefaultAdmin() {
  const db = await getDatabase();
  const admins = db.collection('admins');
  
  const existingAdmin = await admins.findOne({ email: 'admin@mallestays.com' });
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await admins.insertOne({
      id: uuidv4(),
      email: 'admin@mallestays.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Default admin created: admin@mallestays.com / admin123');
  }
  
  // Create sub admin
  const existingSubAdmin = await admins.findOne({ email: 'subadmin@mallestays.com' });
  if (!existingSubAdmin) {
    const hashedPassword = await hashPassword('subadmin123');
    await admins.insertOne({
      id: uuidv4(),
      email: 'subadmin@mallestays.com',
      password: hashedPassword,
      name: 'Sub Admin',
      role: 'sub_admin',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Default sub admin created: subadmin@mallestays.com / subadmin123');
  }
}

export async function getAdmin(email) {
  const db = await getDatabase();
  const admins = db.collection('admins');
  return await admins.findOne({ email });
}

export function checkPermission(userRole, action) {
  const permissions = {
    super_admin: ['all'],
    sub_admin: ['add_property', 'edit_property', 'upload_images', 'manage_bookings', 'respond_reviews']
  };
  
  if (userRole === 'super_admin') return true;
  return permissions[userRole]?.includes(action) || false;
}