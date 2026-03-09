'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Waves, UtensilsCrossed, Wifi, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });
  const [featuredVillas, setFeaturedVillas] = useState([]);

  useEffect(() => {
    fetchFeaturedVillas();
  }, []);

  const fetchFeaturedVillas = async () => {
    try {
      const response = await fetch('/api/villas?limit=3');
      const data = await response.json();
      setFeaturedVillas(data.villas?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.guests) params.append('guests', searchData.guests);
    window.location.href = `/villas?${params.toString()}`;
  };

  const popularLocations = [
    { name: 'Lonavala' },
    { name: 'Alibaug' },
    { name: 'Karjat' },
    { name: 'Igatpuri' },
    { name: 'Neral' },
    { name: 'Khopoli' },
  ];

  const amenitiesHighlight = [
    { icon: Waves, title: 'Private Pools', description: 'Exclusive swimming pools' },
    { icon: UtensilsCrossed, title: 'Gourmet Chef', description: 'Professional chefs' },
    { icon: Wifi, title: 'High-Speed WiFi', description: 'Stay connected' },
    { icon: Car, title: 'Free Parking', description: 'Secure parking' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      <section className="relative h-[600px] bg-primary/10 flex items-center" data-testid="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" data-testid="hero-title">
            Find Your Perfect Getaway
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-600" data-testid="hero-subtitle">
            Curated luxury villas and bungalows for your staycation.
          </p>

          <Card className="max-w-4xl mx-auto" data-testid="search-box">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-left">Location</label>
                  <Select value={searchData.location} onValueChange={(val) => setSearchData({...searchData, location: val})}>
                    <SelectTrigger data-testid="search-location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {popularLocations.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left">Check-in</label>
                  <Input 
                    type="date" 
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    data-testid="search-checkin"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left">Check-out</label>
                  <Input 
                    type="date" 
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    data-testid="search-checkout"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left">Guests</label>
                  <Select value={searchData.guests} onValueChange={(val) => setSearchData({...searchData, guests: val})}>
                    <SelectTrigger data-testid="search-guests">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Guests</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSearch} data-testid="search-button">
                <Search className="mr-2 h-5 w-5" />
                Search Villas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-slate-50" data-testid="popular-locations">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Locations</h2>
            <p className="text-slate-600 text-lg">Discover luxury villas in these amazing destinations</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularLocations.map((location) => (
              <Link href={`/villas?location=${location.name}`} key={location.name}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center p-4" data-testid={`location-card-${location.name.toLowerCase()}`}>
                  <h3 className="font-semibold">{location.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredVillas.length > 0 && (
        <section className="py-16" data-testid="featured-villas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Featured Villas</h2>
              <p className="text-slate-600 text-lg">Handpicked luxury properties just for you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVillas.map((villa) => (
                <Card key={villa.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`featured-villa-${villa.slug}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{villa.name}</h3>
                        <p className="text-slate-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {villa.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">₹{villa.pricePerNight?.toLocaleString()}</div>
                        <div className="text-sm text-slate-600">per night</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 line-clamp-2">{villa.description}</p>
                    <div className="flex gap-4 mt-4 text-sm text-slate-600">
                      <span>{villa.bedrooms} Bedrooms</span>
                      <span>•</span>
                      <span>{villa.maxGuests} Guests</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/villa/${villa.slug}`} className="w-full">
                      <Button className="w-full" data-testid={`view-villa-${villa.slug}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/villas">
                <Button variant="outline" size="lg" data-testid="view-all-villas">
                  View All Villas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-primary text-white" data-testid="amenities-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Premium Amenities</h2>
            <p className="text-white/90 text-lg">Experience luxury like never before</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenitiesHighlight.map((amenity, idx) => (
              <div key={idx} className="text-center" data-testid={`amenity-${idx}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <amenity.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                <p className="text-white/80">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" data-testid="cta-section">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Own a Luxury Villa?</h2>
              <p className="text-xl mb-8 text-white/90">
                Partner with us and showcase your property to thousands of travelers
              </p>
              <Link href="/partner">
                <Button size="lg" variant="secondary" data-testid="partner-cta-button">
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
