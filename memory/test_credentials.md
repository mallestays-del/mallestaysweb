# Test Credentials for Malle Stays

## Admin Login
- **Super Admin**: admin@mallestays.com / admin123
- **Sub Admin**: subadmin@mallestays.com / subadmin123

## Razorpay (LIVE)
- Key ID: rzp_live_TbBwyCzbdG4iLy

## Cloudinary
- Cloud Name: drwpabrdg

## MongoDB Atlas
- User: mallestays
- Cluster: mallestayscluster.nj3glo7.mongodb.net

## WhatsApp Cloud API
- Phone Number ID: 1097368213460843
- Business Account ID: 4329171914005624
- Graph API Version: v21.0
- Admin WhatsApp: +918446620191
- Templates Approved: false (free-form text mode active for admin test number)
- Test endpoint: POST /api/whatsapp/test with header `x-internal-key: <INTERNAL_API_KEY>` from .env
  - Body: `{"to":"+91...","mode":"template"}` for hello_world
  - Body: `{"to":"+91...","mode":"text","text":"..."}` for free-form
  - Body: `{"mode":"simulate","scenario":"confirmation|checkin|recovery"}` for high-level flow
- Cron endpoints auth: `Authorization: Bearer <WEBHOOK_CRON_SECRET>` from .env
  - POST /api/cron/whatsapp-checkin-reminders (daily 10:00 IST)
  - POST /api/cron/whatsapp-abandoned-cart (every :15 UTC)
