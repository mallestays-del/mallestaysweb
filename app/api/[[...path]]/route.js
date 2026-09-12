import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultAdmin, checkPermission } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

// Initialize default admin on startup
createDefaultAdmin().catch(console.error);

// Helper to get request body
async function getBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// Helper to check authentication
async function checkAuth(request) {
  const session = await getServerSession(authOptions);
  console.log('Session in checkAuth:', session);
  if (!session || !session.user) {
    return { error: true, response: NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 }) };
  }
  return { error: false, user: session.user };
}

// ==================== VILLAS API ====================

export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);
  const db = await getDatabase();

  try {
    // Public: Get all locations (auto-seed defaults on first run)
    if (pathname === '/api/locations') {
      const count = await db.collection('locations').countDocuments();
      if (count === 0) {
        const defaults = [
          { name: 'Lonavala', image: 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=400' },
          { name: 'Alibaug', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
          { name: 'Karjat', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
          { name: 'Igatpuri', image: 'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?w=400' },
          { name: 'Neral', image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=400' },
          { name: 'Khopoli', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
          { name: 'Badlapur', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
        ].map((l, i) => ({ id: uuidv4(), ...l, order: i, isActive: true, createdAt: new Date().toISOString() }));
        await db.collection('locations').insertMany(defaults);
      }
      const includeInactive = searchParams.get('all') === 'true';
      const query = includeInactive ? {} : { isActive: { $ne: false } };
      const locations = await db.collection('locations')
        .find(query, { projection: { _id: 0 } })
        .sort({ order: 1, createdAt: 1 })
        .toArray();
      return NextResponse.json({ locations });
    }

    // Get all villas
    if (pathname === '/api/villas') {
      const location = searchParams.get('location');
      const category = searchParams.get('category');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const guests = searchParams.get('guests');
      const bedrooms = searchParams.get('bedrooms');
      
      let query = {};
      if (location && location !== 'all') query.location = location;
      if (category && category !== 'all') query.category = category;
      if (minPrice) query.pricePerNight = { ...query.pricePerNight, $gte: parseFloat(minPrice) };
      if (maxPrice) query.pricePerNight = { ...query.pricePerNight, $lte: parseFloat(maxPrice) };
      if (guests) query.maxGuests = { $gte: parseInt(guests) };
      if (bedrooms) query.bedrooms = parseInt(bedrooms);

      const villas = await db.collection('villas').find(query, { 
        projection: { 
          name: 1, slug: 1, location: 1, category: 1, pricePerNight: 1, originalPrice: 1, 
          bedrooms: 1, maxGuests: 1, images: 1, description: 1, 
          amenities: 1, createdAt: 1, id: 1
        } 
      }).sort({ createdAt: -1 }).limit(100).toArray();
      const res = NextResponse.json({ villas });
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return res;
    }

    // Get single villa by slug
    if (pathname.startsWith('/api/villas/') && pathname.split('/').length === 4) {
      const slug = pathname.split('/api/villas/')[1];
      const villa = await db.collection('villas').findOne({ slug });
      if (!villa) {
        return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
      }
      const res = NextResponse.json({ villa });
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return res;
    }

    // Get reviews for a specific villa
    if (pathname.match(/^\/api\/villas\/[^\/]+\/reviews$/)) {
      const villaId = pathname.split('/')[3];
      const reviews = await db.collection('reviews').find({ 
        villaId,
        approved: true 
      }, { 
        projection: { 
          villaId: 1, villaName: 1, name: 1, rating: 1, comment: 1,
          imageUrl: 1, approved: 1, createdAt: 1, id: 1 
        } 
      }).sort({ createdAt: -1 }).limit(50).toArray();
      return NextResponse.json({ reviews });
    }

    // Get locations
    if (pathname === '/api/locations') {
      const locations = await db.collection('locations').find({}, { 
        projection: { name: 1, image: 1, id: 1 } 
      }).sort({ name: 1 }).limit(100).toArray();
      return NextResponse.json({ locations });
    }

    // Get reviews for a villa
    if (pathname === '/api/reviews') {
      const villaId = searchParams.get('villaId');
      let query = villaId ? { villaId } : {};
      const reviews = await db.collection('reviews').find(query, { 
        projection: { 
          villaId: 1, villaName: 1, name: 1, rating: 1, comment: 1, 
          approved: 1, createdAt: 1, id: 1 
        } 
      }).sort({ createdAt: -1 }).limit(50).toArray();
      return NextResponse.json({ reviews });
    }

    // Get bookings
    if (pathname === '/api/bookings') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const bookings = await db.collection('bookings').find({}, { 
        projection: { 
          id: 1, villaId: 1, villaName: 1, checkIn: 1, checkOut: 1, 
          guests: 1, name: 1, email: 1, phone: 1, status: 1, 
          totalPrice: 1, createdAt: 1 
        } 
      }).sort({ createdAt: -1 }).limit(100).toArray();
      return NextResponse.json({ bookings });
    }

    // Get admin stats
    if (pathname === '/api/admin/stats') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const totalVillas = await db.collection('villas').countDocuments();
      const totalBookings = await db.collection('bookings').countDocuments();
      const confirmedBookings = await db.collection('bookings').countDocuments({ status: 'confirmed' });
      const totalReviews = await db.collection('reviews').countDocuments();
      
      const result = await db.collection('bookings').aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ]).toArray();
      const totalRevenue = result[0]?.totalRevenue || 0;

      return NextResponse.json({
        totalVillas,
        totalBookings,
        confirmedBookings,
        totalReviews,
        totalRevenue
      });
    }

    // Get admins list
    if (pathname === '/api/admin/users') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;
      
      if (authResult.user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const admins = await db.collection('admins').find({}, { 
        projection: { id: 1, email: 1, name: 1, role: 1, createdAt: 1 } 
      }).limit(100).toArray();
      return NextResponse.json({ admins });
    }

    // Get single villa by ID for editing
    if (pathname.startsWith('/api/admin/villas/') && !pathname.includes('guest-reviews')) {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const id = pathname.split('/api/admin/villas/')[1];
      const villa = await db.collection('villas').findOne({ id });
      
      if (!villa) {
        return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
      }
      
      return NextResponse.json({ villa });
    }

    // Get all guest reviews
    if (pathname === '/api/admin/guest-reviews') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const reviews = await db.collection('guestReviews').find({}, { 
        projection: { 
          id: 1, guestName: 1, location: 1, reviewText: 1, 
          rating: 1, imageUrl: 1, source: 1, createdAt: 1 
        } 
      }).sort({ createdAt: -1 }).limit(100).toArray();
      return NextResponse.json({ reviews });
    }

    // Get guest reviews for public display
    if (pathname === '/api/guest-reviews') {
      const reviews = await db.collection('guestReviews').find({}, { 
        projection: { 
          id: 1, guestName: 1, location: 1, reviewText: 1, 
          rating: 1, imageUrl: 1, source: 1 
        } 
      }).sort({ createdAt: -1 }).limit(20).toArray();
      const res = NextResponse.json({ reviews });
      res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
      return res;
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const db = await getDatabase();
  const body = await getBody(request);

  try {
    // Create booking
    if (pathname === '/api/bookings') {
      const { villaId, villaName, checkIn, checkOut, guests, name, email, phone, specialRequests, totalPrice } = body;

      if (!villaId || !checkIn || !checkOut || !name || !email || !phone) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const booking = {
        id: uuidv4(),
        villaId,
        villaName,
        checkIn,
        checkOut,
        guests,
        name,
        email,
        phone,
        specialRequests,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await db.collection('bookings').insertOne(booking);
      return NextResponse.json({ booking, message: 'Booking created successfully' });
    }

    // Submit review
    if (pathname === '/api/reviews') {
      const { villaId, villaName, name, rating, comment, imageUrl } = body;

      if (!villaId || !name || !rating || !comment) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const review = {
        id: uuidv4(),
        villaId,
        villaName,
        name,
        rating: parseInt(rating),
        comment,
        imageUrl: imageUrl || null,
        approved: false,
        createdAt: new Date().toISOString()
      };

      await db.collection('reviews').insertOne(review);
      return NextResponse.json({ review, message: 'Review submitted for approval' });
    }

    // Partner form submission
    if (pathname === '/api/partner') {
      const { name, email, phone, location, description } = body;

      if (!name || !email || !phone || !location) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const partner = {
        id: uuidv4(),
        name,
        email,
        phone,
        location,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await db.collection('partners').insertOne(partner);
      return NextResponse.json({ message: 'Partnership request submitted successfully' });
    }

    // Contact form submission
    if (pathname === '/api/contact') {
      const { name, email, phone, message } = body;

      if (!name || !email || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const contact = {
        id: uuidv4(),
        name,
        email,
        phone,
        message,
        status: 'new',
        createdAt: new Date().toISOString()
      };

      await db.collection('contacts').insertOne(contact);
      return NextResponse.json({ message: 'Message sent successfully' });
    }

    // Admin: Create villa
    if (pathname === '/api/admin/villas') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const { name, location, category, description, pricePerNight, originalPrice, bedrooms, bathrooms, maxGuests, parking, amenities, images, mapLocation } = body;

      if (!name || !location || !category || !description || !pricePerNight) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const villa = {
        id: uuidv4(),
        name,
        slug,
        location,
        category,
        description,
        pricePerNight: parseFloat(pricePerNight),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        maxGuests: parseInt(maxGuests) || 2,
        parking: parseInt(parking) || 1,
        amenities: amenities || [],
        images: images || [],
        mapLocation: mapLocation || '',
        seoTitle: name,
        seoDescription: description.substring(0, 160),
        seoKeywords: `${name}, ${location}, ${category}, luxury villa, vacation rental`,
        createdBy: authResult.user.email,
        createdAt: new Date().toISOString()
      };

      await db.collection('villas').insertOne(villa);
      return NextResponse.json({ villa, message: 'Villa created successfully' });
    }

    // Admin: Create location
    if (pathname === '/api/admin/locations') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const { name, image, order, isActive } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      const existing = await db.collection('locations').findOne({ name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
      if (existing) {
        return NextResponse.json({ error: 'A location with this name already exists' }, { status: 409 });
      }

      const maxOrderDoc = await db.collection('locations').find().sort({ order: -1 }).limit(1).toArray();
      const nextOrder = maxOrderDoc.length ? (maxOrderDoc[0].order ?? 0) + 1 : 0;

      const location = {
        id: uuidv4(),
        name: name.trim(),
        image: image || '',
        order: typeof order === 'number' ? order : nextOrder,
        isActive: isActive !== false,
        createdAt: new Date().toISOString()
      };

      await db.collection('locations').insertOne(location);
      const { _id, ...clean } = location;
      return NextResponse.json({ location: clean, message: 'Location added successfully' });
    }

    // Chat with AI (mocked for now)
    if (pathname === '/api/chat') {
      const { message } = body;

      // Mock AI responses
      const responses = {
        'lonavala': 'We have beautiful villas in Lonavala! Check out Rudra Villa and Serenity Villa. Both offer stunning views and private pools.',
        'price': 'Our villa prices range from ₹8,000 to ₹25,000 per night depending on the location and amenities.',
        'pool': 'All our villas feature private pools! Popular options include Rudra Villa in Lonavala and Azure Villa in Alibaug.',
        'booking': 'To book, simply select your preferred villa, choose check-in/check-out dates, fill in your details, and submit. Our team will confirm within 24 hours!',
        'default': 'Thank you for contacting Malle Stays! I can help you find the perfect villa. What are you looking for? You can ask about locations, prices, amenities, or the booking process.'
      };

      let reply = responses.default;
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('lonavala') || lowerMessage.includes('location')) reply = responses.lonavala;
      else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) reply = responses.price;
      else if (lowerMessage.includes('pool') || lowerMessage.includes('swimming')) reply = responses.pool;
      else if (lowerMessage.includes('book') || lowerMessage.includes('reservation')) reply = responses.booking;

      return NextResponse.json({ reply });
    }

    // Admin: Change Email
    if (pathname === '/api/admin/settings/email') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const { currentEmail, newEmail } = body;

      if (!currentEmail || !newEmail) {
        return NextResponse.json({ error: 'Both current and new email are required' }, { status: 400 });
      }

      // Check if new email already exists
      const existingAdmin = await db.collection('admins').findOne({ email: newEmail });
      if (existingAdmin) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }

      // Update email
      const result = await db.collection('admins').updateOne(
        { email: currentEmail },
        { $set: { email: newEmail, updatedAt: new Date().toISOString() } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Email updated successfully' });
    }

    // Admin: Change Password
    if (pathname === '/api/admin/settings/password') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const { email, currentPassword, newPassword } = body;

      if (!email || !currentPassword || !newPassword) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      // Find admin
      const admin = await db.collection('admins').findOne({ email });
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const result = await db.collection('admins').updateOne(
        { email },
        { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    // Admin: Forgot Password - Send reset email
    if (pathname === '/api/admin/forgot-password') {
      const { email } = body;

      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      try {
        // Find admin
        const admin = await db.collection('admins').findOne({ email: email.toLowerCase() });
        
        if (admin) {
          // Generate reset token
          const crypto = await import('crypto');
          const rawToken = crypto.randomBytes(32).toString('hex');
          const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
          const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          // Store hashed token
          await db.collection('passwordResetTokens').insertOne({
            userId: admin.id,
            email: admin.email,
            tokenHash,
            expiresAt: resetExpiry,
            usedAt: null,
            createdAt: new Date()
          });

          // Send email with Resend
          const { resend, fromAddress } = await import('@/lib/resend');
          const { passwordResetEmail } = await import('@/lib/email-templates');
          
          const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${rawToken}`;
          const emailContent = passwordResetEmail(admin.name || 'Admin', resetUrl);

          await resend.emails.send({
            from: fromAddress,
            to: [admin.email],
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            tags: [{ name: 'type', value: 'password_reset' }]
          }, { 
            idempotencyKey: `password-reset/${admin.id}/${tokenHash}` 
          });
        }

        // Always return same response for security
        return NextResponse.json({ 
          message: 'If this email exists, a password reset link has been sent.' 
        });

      } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({ 
          message: 'If this email exists, a password reset link has been sent.' 
        });
      }
    }

    // Admin: Reset Password with token
    if (pathname === '/api/admin/reset-password') {
      const { token, newPassword } = body;

      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      // Find admin with this token
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const resetToken = await db.collection('passwordResetTokens').findOne({
        tokenHash,
        expiresAt: { $gt: new Date() },
        usedAt: null
      });
      
      if (!resetToken) {
        return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.collection('admins').updateOne(
        { email: resetToken.email },
        { 
          $set: { password: hashedPassword, updatedAt: new Date().toISOString() },
          $unset: { resetToken: '', resetExpiry: '' }
        }
      );
      
      // Mark token as used
      await db.collection('passwordResetTokens').updateOne(
        { tokenHash },
        { $set: { usedAt: new Date() } }
      );

      return NextResponse.json({ message: 'Password reset successfully' });
    }

    // Admin: Create guest review
    if (pathname === '/api/admin/guest-reviews') {
      const authResult = await checkAuth(request);
      if (authResult.error) return authResult.response;

      const { guestName, location, reviewText, rating, imageUrl, source } = body;

      if (!guestName || !location || !reviewText || !imageUrl) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const review = {
        id: uuidv4(),
        guestName,
        location,
        reviewText,
        rating: parseInt(rating) || 5,
        imageUrl,
        source: source || 'WhatsApp Review',
        createdAt: new Date().toISOString()
      };

      await db.collection('guestReviews').insertOne(review);
      return NextResponse.json({ review, message: 'Review created successfully' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url);
  const db = await getDatabase();
  const body = await getBody(request);

  try {
    const authResult = await checkAuth(request);
    if (authResult.error) return authResult.response;

    // Update villa
    if (pathname.startsWith('/api/admin/villas/') && !pathname.includes('guest-reviews')) {
      const id = pathname.split('/api/admin/villas/')[1];
      const { name, location, description, category, pricePerNight, originalPrice, bedrooms, bathrooms, maxGuests, parking, amenities, images, mapLocation, seoTitle, seoDescription, seoKeywords } = body;

      const updateData = {
        name,
        location,
        description,
        category,
        pricePerNight: parseFloat(pricePerNight),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        maxGuests: parseInt(maxGuests),
        parking: parseInt(parking),
        amenities,
        images,
        mapLocation,
        seoTitle: seoTitle || name,
        seoDescription: seoDescription || description.substring(0, 160),
        seoKeywords: seoKeywords || `${name}, ${location}, luxury villa`,
        updatedAt: new Date().toISOString()
      };

      const result = await db.collection('villas').updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Villa updated successfully' });
    }

    // Update location
    if (pathname.startsWith('/api/admin/locations/')) {
      const id = pathname.split('/api/admin/locations/')[1];
      const { name, image, order, isActive } = body;
      const updateData = { updatedAt: new Date().toISOString() };
      if (name !== undefined) {
        if (!name.trim()) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
        const dup = await db.collection('locations').findOne({ id: { $ne: id }, name: { $regex: `^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
        if (dup) return NextResponse.json({ error: 'A location with this name already exists' }, { status: 409 });
        updateData.name = name.trim();
      }
      if (image !== undefined) updateData.image = image;
      if (typeof order === 'number') updateData.order = order;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;

      const result = await db.collection('locations').updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
      const location = await db.collection('locations').findOne({ id }, { projection: { _id: 0 } });
      return NextResponse.json({ location, message: 'Location updated successfully' });
    }

    // Update guest review
    if (pathname.startsWith('/api/admin/guest-reviews/')) {
      const id = pathname.split('/api/admin/guest-reviews/')[1];
      const { guestName, location, reviewText, rating, imageUrl, source } = body;

      const updateData = {
        guestName,
        location,
        reviewText,
        rating: parseInt(rating),
        imageUrl,
        source,
        updatedAt: new Date().toISOString()
      };

      const result = await db.collection('guestReviews').updateOne({ id }, { $set: updateData });
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Review updated successfully' });
    }

    // Update booking status
    if (pathname.startsWith('/api/admin/bookings/')) {
      const id = pathname.split('/api/admin/bookings/')[1];
      const { status } = body;

      const result = await db.collection('bookings').updateOne(
        { id },
        { $set: { status, updatedAt: new Date().toISOString() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Booking updated successfully' });
    }

    // Approve/reject review
    if (pathname.startsWith('/api/admin/reviews/')) {
      const id = pathname.split('/api/admin/reviews/')[1];
      const { approved } = body;

      const result = await db.collection('reviews').updateOne(
        { id },
        { $set: { approved, updatedAt: new Date().toISOString() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Review updated successfully' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url);
  const db = await getDatabase();

  try {
    const authResult = await checkAuth(request);
    if (authResult.error) return authResult.response;

    // Only super_admin or sub_admin can delete
    const userRole = authResult.user?.role;
    if (userRole !== 'sub_admin' && userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Delete location
    if (pathname.startsWith('/api/admin/locations/')) {
      const id = pathname.split('/api/admin/locations/')[1];
      const result = await db.collection('locations').deleteOne({ id });
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Location deleted successfully' });
    }

    // Delete villa
    if (pathname.startsWith('/api/admin/villas/') && !pathname.includes('guest-reviews')) {
      const id = pathname.split('/api/admin/villas/')[1];
      const result = await db.collection('villas').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Villa deleted successfully' });
    }

    // Delete review
    if (pathname.startsWith('/api/admin/reviews/') && !pathname.includes('guest-reviews')) {
      const id = pathname.split('/api/admin/reviews/')[1];
      const result = await db.collection('reviews').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Review deleted successfully' });
    }

    // Delete guest review
    if (pathname.startsWith('/api/admin/guest-reviews/')) {
      const id = pathname.split('/api/admin/guest-reviews/')[1];
      const result = await db.collection('guestReviews').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Guest review not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Guest review deleted successfully' });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
