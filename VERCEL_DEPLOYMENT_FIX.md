# Vercel Deployment Fix - Resend API Key Issue

## Problem Fixed ✅
The Vercel build was failing with:
```
Error: Missing RESEND_API_KEY
```

This happened because the Resend SDK was being initialized at module load time (during build), but the environment variable wasn't available in Vercel.

## Solution Applied
Changed Resend initialization from **eager** to **lazy** loading:

### Before (causing build failure):
```javascript
// lib/resend.js
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### After (build-safe):
```javascript
// lib/resend.js
import { Resend } from "resend";

let resendInstance = null;

export function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY - add it to Vercel settings");
    }
    
    resendInstance = new Resend(apiKey);
  }
  
  return resendInstance;
}
```

Now the Resend client is only created when actually sending an email (at runtime), not during the build process.

## Files Modified
1. `/app/lib/resend.js` - Changed to lazy initialization
2. `/app/app/api/bookings/[bookingId]/send-confirmation/route.js` - Updated import
3. `/app/app/api/[[...path]]/route.js` - Updated password reset email section

## ✅ Build Status
- **Local build**: PASSED ✓
- **Ready for Vercel deployment**

## 🚀 Next Steps for Vercel

### Step 1: Add RESEND_API_KEY to Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxx` (your actual Resend API key)
   - **Environment**: Check all (Production, Preview, Development)
4. Click **Save**

### Step 2: (Optional) Add Custom Sender Email
If you want to use a custom verified domain instead of `onboarding@resend.dev`:
1. Add another environment variable:
   - **Name**: `RESEND_FROM`
   - **Value**: `Malle Stays <noreply@mallestays.com>`
   - **Environment**: Check all
2. Make sure this email/domain is verified in your Resend dashboard

### Step 3: Redeploy
After adding the environment variables:
1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click **Redeploy**
4. Or simply push a new commit to trigger automatic deployment

## Important Notes

⚠️ **Email will only work at runtime** - The build will now succeed even without RESEND_API_KEY, but emails won't send unless you add the key to Vercel.

⚠️ **Security Reminder** - If your Resend API key was exposed in previous chat messages, consider regenerating it in the Resend dashboard for security.

## Testing After Deployment

Once deployed with the API key:
1. Test password reset flow: Go to `/admin/forgot-password`
2. Test booking confirmation: Complete a test booking

Check Vercel Function Logs to see if emails are sending successfully.
