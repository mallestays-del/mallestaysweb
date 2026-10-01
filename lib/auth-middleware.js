import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { NextResponse } from 'next/server';

/**
 * Middleware to verify admin authentication for API routes
 * Usage: const session = await requireAdmin(request);
 */
export async function requireAdmin(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Unauthorized - Admin login required');
  }
  
  return session;
}

/**
 * Wrapper for API routes that require admin authentication
 * Returns 401 response if not authenticated
 */
export async function withAdminAuth(handler) {
  return async (request, context) => {
    try {
      const session = await requireAdmin(request);
      return await handler(request, context, session);
    } catch (error) {
      return NextResponse.json(
        { error: error.message || 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(session, permission) {
  const role = session?.user?.role;
  
  if (role === 'super_admin') return true;
  
  const permissions = {
    sub_admin: [
      'add_property',
      'edit_property',
      'upload_images',
      'manage_bookings',
      'manage_availability',
      'respond_reviews'
    ]
  };
  
  return permissions[role]?.includes(permission) || false;
}
