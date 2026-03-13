'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Users, Bed, ArrowLeft, Calendar, Bath, Car, Star, Wifi, Waves, UtensilsCrossed, Music, Gamepad2, ShieldCheck, Wind } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function VillaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    guests: '',
    checkIn: '',
    checkOut: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchVilla();
    }
  }, [params.slug]);

  const fetchVilla = async () => {
    try {
      const response = await fetch(`/api/villas/${params.slug}`);
      const data = await response.json();
      if (response.ok) {
        setVilla(data.villa);
      } else {
        toast.error('Villa not found');
        router.push('/villas');
      }
    } catch (error) {
      console.error('Error fetching villa:', error);
      toast.error('Failed to load villa');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingData.name || !bookingData.phone || !bookingData.email || !bookingData.guests || !bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please fill all required fields');
      return;
    }

    if (bookingData.guests > (villa.maxGuests || 12)) {
      toast.error(`Maximum ${villa.maxGuests || 12} guests allowed`);
      return;
    }

    setBookingLoading(true);

    try {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (nights <= 0) {
        toast.error('Check-out date must be after check-in date');
        setBookingLoading(false);
        return;
      }

      const totalPrice = nights * (villa.pricePerNight || 0);
      
      // Format the message for WhatsApp
      const whatsappMessage = `*New Villa Booking Enquiry*

🏠 *Property:* ${villa.name}
📍 *Location:* ${villa.location}

📅 *Check-in:* ${checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
📅 *Check-out:* ${checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
🌙 *Nights:* ${nights}
👥 *Guests:* ${bookingData.guests}

💰 *Estimated Price:* ₹${totalPrice.toLocaleString('en-IN')}

👤 *Guest Details:*
Name: ${bookingData.name}
Phone: ${bookingData.phone}
Email: ${bookingData.email}

---
Sent via Malle Stays`;

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      
      // Your WhatsApp number
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918446620191';
      
      // Construct WhatsApp URL
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      toast.success('Redirecting to WhatsApp... Please send the enquiry from there.');
      
      // Reset form after a short delay
      setTimeout(() => {
        setBookingData({
          name: '',
          phone: '',
          email: '',
          guests: '',
          checkIn: '',
          checkOut: ''
        });
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to process booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Amenity icons mapping
  const amenityIcons = {
    'AC': <Wind className="h-5 w-5 text-blue-600" />,
    'Pool': <Waves className="h-5 w-5 text-blue-600" />,
    'Swimming Pool': <Waves className="h-5 w-5 text-blue-600" />,
    'Private Pool': <Waves className="h-5 w-5 text-blue-600" />,
    'WiFi': <Wifi className="h-5 w-5 text-blue-600" />,
    'Wifi': <Wifi className="h-5 w-5 text-blue-600" />,
    'Parking': <Car className="h-5 w-5 text-blue-600" />,
    'Private Parking': <Car className="h-5 w-5 text-blue-600" />,
    'Kitchen': <UtensilsCrossed className="h-5 w-5 text-blue-600" />,
    'Dining': <UtensilsCrossed className="h-5 w-5 text-blue-600" />,
    'Music': <Music className="h-5 w-5 text-blue-600" />,
    'Games': <Gamepad2 className="h-5 w-5 text-blue-600" />,
    'Caretaker': <ShieldCheck className="h-5 w-5 text-blue-600" />,
    'TV': <Star className="h-5 w-5 text-blue-600" />
  };

  const getAmenityIcon = (amenity) => {
    for (const [key, icon] of Object.entries(amenityIcons)) {
      if (amenity.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return <Star className="h-5 w-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading villa details...</p>
        </div>
      </div>
    );
  }

  if (!villa) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => router.push('/villas')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Villas
        </Button>
      </div>

      {/* Image Gallery Section */}
      <div className="container mx-auto px-4 mb-8">
        {/* Main Image */}
        <div className="relative h-[500px] rounded-xl overflow-hidden mb-4">
          <img
            src={villa.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'}
            alt={villa.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-6 gap-4">
          {villa.images?.slice(0, 6).map((image, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                currentImageIndex === index ? 'border-yellow-600' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img
                src={image}
                alt={`${villa.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Overview */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 border-b-2 border-slate-200 pb-2">Property Overview</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Bedrooms</p>
                      <p className="font-semibold">{villa.bedrooms || 4} AC Bedrooms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Bath className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Bathrooms</p>
                      <p className="font-semibold">{villa.bathrooms || 5} Bathrooms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Capacity</p>
                      <p className="font-semibold">Up to {villa.maxGuests || 12} Guests</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Parking</p>
                      <p className="font-semibold">{villa.parking || 3} Cars</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <p className="text-slate-700 leading-relaxed">
                    {villa.description || `Welcome to ${villa.name}, a luxurious retreat in the heart of ${villa.location}. Perfect for family gatherings, group celebrations, and weekend getaways.`}
                  </p>
                  
                  <p className="text-slate-700 leading-relaxed">
                    The villa features {villa.bedrooms || 4} beautifully appointed AC bedrooms with comfortable beds and modern amenities. 
                    With {villa.bathrooms || 5} well-maintained bathrooms equipped with geysers for hot water, your comfort is our priority.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exclusive Amenities */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6 border-b-2 border-slate-200 pb-2">Exclusive Amenities</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {villa.amenities?.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      {getAmenityIcon(amenity)}
                      <span className="text-slate-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-yellow-600 pb-2">Book Your Stay</h2>
                  
                  <form onSubmit={handleBooking} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="+91-9876543210"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>

                    {/* Number of Guests */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Number of Guests (Max {villa.maxGuests || 12}) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="2"
                        min="1"
                        max={villa.maxGuests || 12}
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>

                    {/* Check-in Date */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-in Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Check-out Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                        required
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>

                    {/* Price Display */}
                    {bookingData.checkIn && bookingData.checkOut && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700">Price per night:</span>
                          <span className="font-semibold">₹{villa.pricePerNight?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-slate-700">Total nights:</span>
                          <span className="font-semibold">
                            {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                        <div className="border-t border-yellow-300 mt-2 pt-2 flex justify-between items-center">
                          <span className="font-bold text-lg">Estimated Total:</span>
                          <span className="font-bold text-lg text-yellow-700">
                            ₹{(Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) * villa.pricePerNight).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-3 text-lg"
                    >
                      {bookingLoading ? 'Processing...' : 'SEND ENQUIRY'}
                    </Button>

                    <p className="text-xs text-center text-slate-500 mt-2">
                      Your enquiry will be sent via WhatsApp
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
