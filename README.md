# Malle Stays - Luxury Villa Booking Platform

A comprehensive luxury villa booking platform built with Next.js 14, MongoDB, and modern web technologies.

## 🌟 Features

### Public Website
- **Home Page** - Hero section with search, popular locations, featured villas
- **Villa Listing** - Advanced filters (location, price, guests, bedrooms)
- **Villa Details** - Gallery, amenities, booking form with price calculation
- **Gallery** - Organized villa photos (villas, pools, interiors, nature)
- **Reviews** - Guest reviews with ratings and approval system
- **Contact** - Contact form with map integration
- **Partner** - Property submission form for villa owners
- **AI Chatbot** - Floating chat support with mock responses

### Admin Dashboard
- **Super Admin** - Full access to all features
- **Sub Admin** - Limited access (no delete permissions)
- **Stats Dashboard** - Total villas, bookings, revenue tracking
- **Property Management** - Add/Edit/Delete villas with no-code interface
- **Booking Management** - View and manage booking requests
- **Review Management** - Approve/reject guest reviews
- **SEO Management** - Custom SEO settings for each villa

### Key Features
- ✅ Role-based authentication (Super Admin & Sub Admin)
- ✅ Responsive design with Tailwind CSS & ShadCN UI
- ✅ Search & filter system for villas
- ✅ Booking system (without payment gateway as per requirements)
- ✅ Review & rating system with approval workflow
- ✅ AI chatbot support (mocked for now)
- ✅ SEO optimized pages with metadata
- ✅ Image upload system (URL-based, ready for Cloudinary integration)
- ✅ Mobile-friendly navigation
- ✅ Beautiful UI with modern design principles

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **UI Components**: ShadCN UI + Tailwind CSS
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS with custom design system

## 📁 Project Structure

```
/app/
├── app/
│   ├── api/[[...path]]/route.js    # All backend API routes
│   ├── admin/                       # Admin dashboard pages
│   │   ├── page.js                  # Main admin dashboard
│   │   ├── login/page.js            # Admin login
│   │   └── villas/add/page.js       # Add villa form
│   ├── villas/page.js               # Villa listing page
│   ├── villa/[slug]/page.js         # Villa details page
│   ├── gallery/page.js              # Gallery page
│   ├── reviews/page.js              # Reviews page
│   ├── contact/page.js              # Contact page
│   ├── partner/page.js              # Partner form page
│   ├── page.js                      # Home page
│   └── layout.js                    # Root layout
├── components/
│   ├── Navbar.js                    # Navigation component
│   ├── Footer.js                    # Footer component
│   ├── ChatBot.js                   # AI chatbot component
│   └── ui/                          # ShadCN UI components
├── lib/
│   ├── mongodb.js                   # MongoDB connection
│   └── auth.js                      # Authentication utilities
├── .env                             # Environment variables
└── package.json                     # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017
- Yarn package manager

### Installation

1. **Install Dependencies**
```bash
cd /app
yarn install
```

2. **Environment Variables**
```bash
# Already configured in /app/.env
MONGO_URL=mongodb://localhost:27017
DB_NAME=mallestays
NEXTAUTH_URL=https://malle-deployment.preview.emergentagent.com
NEXTAUTH_SECRET=mallestays-secret-key-change-in-production

# Mock API Keys (to be replaced)
OPENAI_API_KEY=mock-openai-key
CLOUDINARY_CLOUD_NAME=mock-cloud-name
CLOUDINARY_API_KEY=mock-api-key
CLOUDINARY_API_SECRET=mock-api-secret
```

3. **Run Development Server**
```bash
sudo supervisorctl restart all
```

The application will be available at: **https://malle-deployment.preview.emergentagent.com**

## 🔐 Default Admin Credentials

**Super Admin:**
- Email: `admin@mallestays.com`
- Password: `admin123`

**Sub Admin:**
- Email: `subadmin@mallestays.com`
- Password: `subadmin123`

## 📊 Database Collections

- **admins** - Admin user accounts with roles
- **villas** - Property listings
- **bookings** - Booking requests
- **reviews** - Guest reviews
- **locations** - Location master data
- **partners** - Partnership requests
- **contacts** - Contact form submissions

## 🎨 Design System

**Colors:**
- Primary: Custom primary color
- Secondary: Slate tones
- Background: White/Slate-50
- Text: Slate-900/Slate-600

**Components:**
- Cards with hover effects
- Responsive navigation
- Mobile-friendly filters
- Beautiful form inputs
- Toast notifications
- Modal dialogs

## 🔌 API Endpoints

### Public APIs
- `GET /api/villas` - Get all villas (with filters)
- `GET /api/villas/:slug` - Get single villa
- `GET /api/locations` - Get locations
- `GET /api/reviews` - Get reviews
- `POST /api/bookings` - Create booking
- `POST /api/reviews` - Submit review
- `POST /api/contact` - Submit contact form
- `POST /api/partner` - Submit partnership request
- `POST /api/chat` - AI chat (mocked)

### Admin APIs (Authenticated)
- `POST /api/admin/villas` - Create villa
- `PUT /api/admin/villas/:id` - Update villa
- `DELETE /api/admin/villas/:id` - Delete villa (super admin only)
- `PUT /api/admin/bookings/:id` - Update booking status
- `PUT /api/admin/reviews/:id` - Approve/reject review
- `DELETE /api/admin/reviews/:id` - Delete review (super admin only)
- `GET /api/admin/stats` - Get dashboard stats

## 🧪 Testing

The application includes:
- Data-testid attributes for automation testing
- Comprehensive form validation
- Error handling
- Loading states
- Empty states

## 📝 Sample Data

The database is pre-seeded with:
- 3 luxury villas (Serenity Villa, Azure Villa, Rudra Villa)
- 7 locations (Lonavala, Alibaug, Karjat, Igatpuri, Neral, Khopoli, Badlapur)
- 2 admin users (super admin & sub admin)

## 🔮 Future Enhancements

- Real OpenAI integration for AI chat
- Cloudinary integration for image uploads
- Payment gateway integration (Razorpay/Stripe)
- Email notifications
- WhatsApp booking
- Dynamic pricing
- Multi-language support
- Mobile app
- Advanced analytics

## 🎯 Key Highlights

1. **No-Code Property Management** - Admins can add/edit villas without technical knowledge
2. **Role-Based Access** - Super Admin and Sub Admin with different permissions
3. **Beautiful UI** - Modern, responsive design with ShadCN UI
4. **SEO Optimized** - Custom metadata and SEO settings for each property
5. **Search & Filter** - Advanced villa search with multiple filters
6. **Review System** - Guest reviews with approval workflow
7. **AI Chatbot** - Customer support via chatbot
8. **Mobile Responsive** - Works perfectly on all devices

## 📞 Support

For any queries or issues:
- Email: info@mallestays.com
- Phone: +91 98765 43210

## 📄 License

Private and Confidential - Malle Stays © 2024

---

**Built with ❤️ using Next.js, MongoDB, and modern web technologies.**
