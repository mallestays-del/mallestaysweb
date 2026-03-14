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
          name: 1, slug: 1, location: 1, category: 1, pricePerNight: 1, 
          bedrooms: 1, maxGuests: 1, images: 1, description: 1, 
          amenities: 1, createdAt: 1, id: 1
        } 
      }).sort({ createdAt: -1 }).limit(100).toArray();
      return NextResponse.json({ villas });
    }

    // Get single villa by slug
    if (pathname.startsWith('/api/villas/')) {
      const slug = pathname.split('/api/villas/')[1];
      const villa = await db.collection('villas').findOne({ slug });
      if (!villa) {
        return NextResponse.json({ error: 'Villa not found' }, { status: 404 });
      }
      return NextResponse.json({ villa });
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
      return NextResponse.json({ reviews });
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
      const { villaId, villaName, name, rating, comment } = body;

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

      const { name, location, category, description, pricePerNight, bedrooms, bathrooms, maxGuests, parking, amenities, images, mapLocation } = body;

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

      const { name, image } = body;

      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }

      const location = {
        id: uuidv4(),
        name,
        image: image || '',
        createdAt: new Date().toISOString()
      };

      await db.collection('locations').insertOne(location);
      return NextResponse.json({ location, message: 'Location added successfully' });
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
      const { name, location, description, category, pricePerNight, bedrooms, bathrooms, maxGuests, parking, amenities, images, mapLocation, seoTitle, seoDescription, seoKeywords } = body;

      const updateData = {
        name,
        location,
        description,
        category,
        pricePerNight: parseFloat(pricePerNight),
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
