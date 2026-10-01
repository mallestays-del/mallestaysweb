# Security Update: Admin API Authentication Middleware

## ✅ What Was Implemented

Added authentication middleware to protect admin-only API endpoints, specifically the Availability Management API.

---

## Changes Made

### 1. Created Auth Middleware Library
**File**: `/app/lib/auth-middleware.js`

**Features**:
- `requireAdmin(request)` - Verifies admin session, throws error if unauthorized
- `withAdminAuth(handler)` - Wrapper function for API routes requiring auth
- `hasPermission(session, permission)` - Checks specific user permissions

**Usage Example**:
```javascript
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request) {
  try {
    // This line verifies admin authentication
    await requireAdmin(request);
    
    // Only authenticated admins reach this code
    // ... your API logic here
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### 2. Extracted Auth Options
**File**: `/app/lib/auth-options.js`

Moved NextAuth configuration to a separate file so it can be imported by:
- NextAuth API route (`/api/auth/[...nextauth]/route.js`)
- Auth middleware (`/lib/auth-middleware.js`)
- Other API routes that need session verification

### 3. Updated Availability API
**File**: `/app/app/api/v1/availability/route.js`

**Before** (No Auth):
```javascript
export async function POST(request) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    // Anyone could block/unblock dates
  }
}
```

**After** (Auth Required):
```javascript
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request) {
  try {
    // Verify admin authentication FIRST
    await requireAdmin(request);
    
    const db = await getDatabase();
    const body = await request.json();
    // Only authenticated admins can block/unblock dates
  }
}
```

### 4. Fixed Import Paths
**File**: `/app/app/api/[[...path]]/route.js`

Updated to use the new centralized auth options:
```javascript
// OLD
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// NEW  
import { authOptions } from '@/lib/auth-options';
```

---

## Security Improvements

### Before This Update
❌ **Vulnerability**: Anyone could call `POST /api/v1/availability` to block/unblock villa dates without authentication.

**Attack Example**:
```bash
# Malicious user could block ALL dates for ALL villas
curl -X POST https://mallestays.com/api/v1/availability \
  -H "Content-Type: application/json" \
  -d '{
    "villaId": "any-villa-id",
    "dates": ["2026-03-01", "2026-03-02", ...],
    "action": "block"
  }'
```

### After This Update
✅ **Protected**: The endpoint now requires a valid admin session.

**Unauthorized Request**:
```bash
curl -X POST https://mallestays.com/api/v1/availability \
  -H "Content-Type: application/json" \
  -d '{"villaId": "...", "action": "block"}'

# Response: 401 Unauthorized
{
  "error": "Unauthorized - Admin login required"
}
```

**Authorized Request** (must include session cookie from admin login):
```bash
# Admin must be logged in via /admin/login first
# Browser automatically includes session cookie
# Request succeeds: 200 OK
```

---

## How It Works

### Authentication Flow

```
1. Admin logs in at /admin/login
   ↓
2. NextAuth creates session (JWT token stored in cookie)
   ↓
3. Admin opens /admin/availability page
   ↓
4. User clicks date to block
   ↓
5. Frontend sends POST to /api/v1/availability
   ↓
6. API calls requireAdmin(request)
   ↓
7. requireAdmin() checks session cookie
   ↓
8. If valid session → Allow request
   If no session → Return 401 Unauthorized
```

### Session Verification

The `requireAdmin()` function:
1. Extracts session from request headers/cookies
2. Validates JWT token signature
3. Checks if session contains user data
4. Returns session if valid
5. Throws error if invalid/missing

---

## Permission System

The middleware supports role-based permissions:

**Super Admin** (`super_admin`):
- Full access to everything
- `hasPermission(session, 'any_action')` → `true`

**Sub Admin** (`sub_admin`):
- Limited permissions:
  - `add_property`
  - `edit_property`
  - `upload_images`
  - `manage_bookings`
  - `manage_availability` ✅ NEW
  - `respond_reviews`

**Usage in API**:
```javascript
import { requireAdmin, hasPermission } from '@/lib/auth-middleware';

export async function POST(request) {
  const session = await requireAdmin(request);
  
  // Check specific permission
  if (!hasPermission(session, 'manage_availability')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Proceed with action
}
```

---

## Testing the Security

### Test 1: Unauthenticated Request (Should Fail)

**Using Browser DevTools**:
1. Open browser in **Incognito/Private mode** (no session)
2. Open DevTools → Console
3. Run:
   ```javascript
   fetch('/api/v1/availability', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       villaId: 'test-id',
       date: '2026-12-25',
       action: 'block'
     })
   })
   .then(r => r.json())
   .then(console.log);
   ```
4. **Expected Result**: `{ error: "Unauthorized - Admin login required" }`
5. **Status**: `401`

### Test 2: Authenticated Request (Should Succeed)

1. Login at `/admin/login`
2. Navigate to `/admin/availability`
3. Click any available date to block it
4. **Expected Result**: Date turns orange, toast shows "Date blocked successfully"
5. Check Network tab: POST request returns `200 OK`

### Test 3: Session Expiry

1. Login at `/admin/login`
2. Wait for session to expire (default: 30 days for JWT, configurable)
3. Try to block a date
4. **Expected Result**: `401 Unauthorized`, redirected to login

---

## Configuration

### Session Duration

In `/lib/auth-options.js`, you can configure:

```javascript
export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (default)
  },
  // ...
};
```

To change session duration:
```javascript
maxAge: 7 * 24 * 60 * 60,  // 7 days
maxAge: 60 * 60,            // 1 hour
maxAge: 24 * 60 * 60,       // 24 hours
```

### NEXTAUTH_SECRET

Ensure `NEXTAUTH_SECRET` is set in your environment:

**Local** (`.env`):
```env
NEXTAUTH_SECRET=your-super-secret-random-string-here
NEXTAUTH_URL=http://localhost:3000
```

**Vercel Production**:
1. Settings → Environment Variables
2. Add `NEXTAUTH_SECRET` (generate a random 32+ char string)
3. Add `NEXTAUTH_URL` (your production domain)

---

## Other API Endpoints to Protect

### Recommended Auth Protection

These endpoints should also use `requireAdmin()`:

1. **POST `/api/admin/villas`** - Create villa
2. **PUT `/api/admin/villas/[id]`** - Update villa  
3. **DELETE `/api/admin/villas/[id]`** - Delete villa
4. **POST `/api/admin/offers`** - Create offer
5. **PUT `/api/admin/offers/[id]`** - Update offer
6. **DELETE `/api/admin/offers/[id]`** - Delete offer
7. **POST `/api/upload`** - File uploads
8. **Any route under `/api/admin/*`**

### How to Add Auth to Other Routes

Example for villa creation:

```javascript
// /app/app/api/admin/villas/route.js
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request) {
  try {
    // Add this line
    await requireAdmin(request);
    
    // Existing villa creation logic
    const db = await getDatabase();
    const body = await request.json();
    // ...
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    // Handle other errors
  }
}
```

---

## Files Changed

- ✅ **Created**: `/app/lib/auth-middleware.js` - Auth helper functions
- ✅ **Created**: `/app/lib/auth-options.js` - Centralized NextAuth config
- ✅ **Modified**: `/app/app/api/v1/availability/route.js` - Added auth to POST endpoint
- ✅ **Modified**: `/app/app/api/auth/[...nextauth]/route.js` - Use shared config
- ✅ **Modified**: `/app/app/api/[[...path]]/route.js` - Updated import path

---

## Security Best Practices Implemented

✅ **Authentication Required**: Admin endpoints verify session
✅ **Role-Based Access**: Separate permissions for super_admin vs sub_admin
✅ **JWT Tokens**: Secure, stateless session management
✅ **HTTPS Only**: Sessions work over secure connections (in production)
✅ **401 Responses**: Clear error messages for unauthorized access
✅ **Reusable Middleware**: Easy to apply to other routes

---

## Next Steps

1. **Apply auth to other admin endpoints** (villa CRUD, offers, uploads)
2. **Add rate limiting** to prevent brute force attacks
3. **Enable HTTPS** in production (Vercel handles this automatically)
4. **Monitor failed auth attempts** (add logging to `requireAdmin()`)
5. **Consider API keys** for programmatic access (if needed)

---

**Security Status**: ✅ Availability API is now protected. Unauthorized users cannot modify villa availability.
