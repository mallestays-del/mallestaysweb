'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Users, Bed, Wifi, Car, UtensilsCrossed, Waves, ArrowLeft, Calendar, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from 'sonner';

export default function VillaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [villa, setVilla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
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

  const calculatePrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !villa) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * villa.pricePerNight : 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const totalPrice = calculatePrice();
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villaId: villa.id,
          villaName: villa.name,
          ...bookingData,
          totalPrice
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Booking request submitted! We will contact you soon.');
        setBookingData({
          checkIn: '',
          checkOut: '',
          guests: '2',
          name: '',
          email: '',
          phone: '',
          specialRequests: ''
        });
      } else {
        toast.error(data.error || 'Failed to submit booking');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading villa...</p>
        </div>
      </div>
    );
  }

  if (!villa) return null;

  const amenityIcons = {
    'Pool': Waves,
    'WiFi': Wifi,
    'Parking': Car,
    'Chef': UtensilsCrossed
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="villa-details-page">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/villas">
            <Button variant="ghost" data-testid="back-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Villas
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <Card data-testid="villa-gallery">
              <CardContent className="p-6">
                {villa.images && villa.images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {villa.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <img src={image} alt={`${villa.name} - ${index + 1}`} className="w-full h-96 object-cover rounded-lg" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85"
                    alt={villa.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card data-testid="villa-details">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{villa.name}</CardTitle>
                    <p className="text-slate-600 flex items-center mt-2">
                      <MapPin className="h-5 w-5 mr-2" />
                      {villa.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">₹{villa.pricePerNight?.toLocaleString()}</div>
                    <div className="text-slate-600">per night</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2 text-primary" />
                    <span>{villa.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>{villa.maxGuests} Guests</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{villa.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {villa.amenities && villa.amenities.length > 0 && (
              <Card data-testid="villa-amenities">
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {villa.amenities.map((amenity, index) => {
                      const Icon = amenityIcons[amenity] || Waves;
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20" data-testid="booking-form">
              <CardHeader>
                <CardTitle>Book This Villa</CardTitle>
                <CardDescription>Fill in your details to make a reservation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-in Date *</label>
                    <Input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      data-testid="checkin-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Check-out Date *</label>
                    <Input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                      min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      required
                      data-testid="checkout-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Guests *</label>
                    <Input
                      type="number"
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                      min="1"
                      max={villa.maxGuests}
                      required
                      data-testid="guests-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                      required
                      data-testid="name-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      required
                      data-testid="email-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone *</label>
                    <Input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      required
                      data-testid="phone-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Special Requests</label>
                    <Textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      rows={3}
                      data-testid="special-requests-input"
                    />
                  </div>
                  {calculatePrice() > 0 && (
                    <div className="bg-slate-100 p-4 rounded-lg" data-testid="price-summary">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Nights:</span>
                        <span>{Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">₹{calculatePrice().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={bookingLoading} data-testid="submit-booking-button">
                    {bookingLoading ? 'Submitting...' : 'Submit Booking Request'}
                  </Button>
                  <p className="text-xs text-center text-slate-600">
                    You won't be charged yet. We'll contact you to confirm your booking.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
