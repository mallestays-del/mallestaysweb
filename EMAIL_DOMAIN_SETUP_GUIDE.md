# Email Domain Setup Guide for Malle Stays

## Overview
Your application uses **Resend** for sending booking confirmation and password reset emails. To ensure emails are delivered successfully and don't land in spam, you need to verify your sending domain in Resend.

---

## Current Status

✅ **Resend SDK Installed**: The `resend` package is integrated
✅ **API Key Added**: `RESEND_API_KEY` is configured (needs to be added to Vercel)
✅ **Email Templates**: Booking confirmation and password reset templates created
⚠️ **Domain Verification**: **PENDING** - Required for production

**Current Sender**: `Malle Stays <onboarding@resend.dev>` (Resend's default domain)
**Recommended**: `Malle Stays <noreply@mallestays.com>` (Your verified domain)

---

## Why Verify Your Domain?

1. **Better Deliverability**: Emails from verified domains are less likely to be marked as spam
2. **Professional Branding**: Emails come from `@mallestays.com` instead of `@resend.dev`
3. **Trust**: Recipients see your actual domain
4. **Required for Production**: Resend's default domain has sending limits

---

## Step-by-Step Setup

### Step 1: Login to Resend Dashboard

1. Go to [resend.com](https://resend.com)
2. Login with your Resend account credentials
3. Navigate to **Domains** section in the left sidebar

### Step 2: Add Your Domain

1. Click **"Add Domain"**
2. Enter your domain: `mallestays.com`
3. Click **"Add"**

### Step 3: Get DNS Records

Resend will provide you with DNS records to add to your domain:

**Example Records** (your actual values will be different):

```
Type: TXT
Name: @
Value: resend-domain-verify=abc123xyz...

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;

Type: TXT  
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBA...
```

### Step 4: Add DNS Records to Hostinger

Since your domain `mallestays.com` is managed at **Hostinger**:

1. **Login to Hostinger**
   - Go to [hostinger.com](https://www.hostinger.com)
   - Login to your account

2. **Navigate to DNS Zone**
   - Go to **Domains** → Select `mallestays.com`
   - Click on **DNS Zone** or **Manage DNS**

3. **Add Each Record**
   - Click **"Add Record"** or **"Add New Record"**
   - For each record provided by Resend:
     - Select the **Type** (TXT, MX, etc.)
     - Enter the **Name/Host** (use `@` for root domain)
     - Enter the **Value/Points to**
     - Set **TTL** to 3600 (1 hour) or leave default
     - For MX records, set **Priority** as specified
   - Click **"Add"** or **"Save"**

4. **Important Notes**:
   - If Hostinger auto-appends your domain to the Name field, just enter what Resend specifies
   - Some providers require `@` for root domain, others want it blank
   - MX records need a priority value (usually 10)

### Step 5: Verify in Resend

1. Go back to Resend dashboard
2. Click **"Verify Domain"** next to your domain
3. Resend will check the DNS records
4. **DNS propagation can take 10 minutes to 48 hours** (usually 15-30 minutes)
5. If verification fails, wait a bit longer and try again

### Step 6: Update Your Application

Once your domain is verified:

1. **Update Environment Variable**:
   - Add to your `.env` file (local) and Vercel (production):
     ```
     RESEND_FROM=Malle Stays <noreply@mallestays.com>
     ```
   - Or use:
     ```
     RESEND_FROM=Malle Stays <bookings@mallestays.com>
     ```

2. **Restart Your Application** (for local changes to take effect)

3. **Redeploy to Vercel** (if you added the env var there)

---

## Testing Email Delivery

### Test Password Reset Email

1. Go to your admin login page: `/admin/login`
2. Click **"Forgot Password?"**
3. Enter: `admin@mallestays.com`
4. Click **"Send Reset Link"**
5. Check your inbox (and spam folder)

### Test Booking Confirmation Email

Option 1: **Manual API Call**

```bash
curl -X POST https://mallestays.com/api/bookings/{bookingId}/send-confirmation \
  -H "Content-Type: application/json"
```

Replace `{bookingId}` with an actual booking ID from your database.

Option 2: **Complete a Test Booking**

1. Go to any villa page
2. Select dates and click **"BOOK NOW"**
3. Complete the Razorpay payment (use test mode)
4. Booking confirmation email should be sent automatically

---

## Checking Email Logs in Resend

1. Login to Resend dashboard
2. Go to **Emails** section
3. You'll see a list of all sent emails with:
   - Status (Delivered, Bounced, etc.)
   - Recipient
   - Subject
   - Timestamp
   - Delivery details

---

## Common Issues & Solutions

### Issue 1: "Domain not verified"
**Solution**: Wait for DNS propagation (up to 48 hours). Use online DNS checker tools like [whatsmydns.net](https://www.whatsmydns.net) to verify records are live.

### Issue 2: Emails going to spam
**Solution**:
- Ensure all DNS records (SPF, DKIM, DMARC) are properly configured
- Ask Resend support to check your domain configuration
- Warm up your domain by sending a few test emails first

### Issue 3: "Invalid sender address" error
**Solution**: Make sure the email address in `RESEND_FROM` exactly matches a verified domain. For example:
- ✅ `noreply@mallestays.com` (if mallestays.com is verified)
- ❌ `noreply@malle-stays.com` (different domain)

### Issue 4: Can't receive test emails
**Solution**:
- Check spam folder
- Use a different email provider (Gmail, Outlook)
- Check Resend dashboard logs for delivery status
- Verify the recipient email in code matches your test email

---

## Production Checklist

Before going live, ensure:

- [ ] Domain verified in Resend dashboard (green checkmark)
- [ ] All DNS records added to Hostinger
- [ ] `RESEND_API_KEY` added to Vercel environment variables
- [ ] `RESEND_FROM` set to your verified domain email
- [ ] Test password reset email sent successfully
- [ ] Test booking confirmation sent successfully  
- [ ] Emails not landing in spam
- [ ] Email content looks correct (branding, links work)
- [ ] Sender name appears as "Malle Stays"

---

## Environment Variables Summary

**Local Development** (`.env`):
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=Malle Stays <noreply@mallestays.com>
```

**Vercel Production**:
1. Go to Vercel project → Settings → Environment Variables
2. Add both variables above
3. Check all environments: Production, Preview, Development
4. Redeploy

---

## Support

**Resend Support**: If you encounter issues with domain verification or email delivery, contact Resend support:
- Email: support@resend.com  
- Dashboard: Click the chat icon in bottom right
- Docs: [resend.com/docs](https://resend.com/docs)

**Hostinger Support**: For DNS-related questions:
- Email: support@hostinger.com
- Live chat available in your Hostinger account

---

## Next Steps

1. ✅ **Add domain to Resend**
2. ✅ **Configure DNS records in Hostinger**  
3. ✅ **Wait for verification**
4. ✅ **Update RESEND_FROM environment variable**
5. ✅ **Test email delivery**
6. ✅ **Monitor email logs**

---

**Implementation Status**: Email code is production-ready. Domain verification is the only remaining step before going live.
