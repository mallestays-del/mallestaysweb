'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Waves, UtensilsCrossed, Wifi, Car, Sparkles, Star } from 'lucide-react';
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
    { name: 'Lonavala', color: 'from-purple-500 to-pink-500', icon: '🏔️' },
    { name: 'Alibaug', color: 'from-blue-500 to-cyan-500', icon: '🏖️' },
    { name: 'Karjat', color: 'from-green-500 to-emerald-500', icon: '🌳' },
    { name: 'Igatpuri', color: 'from-orange-500 to-red-500', icon: '🌄' },
    { name: 'Neral', color: 'from-indigo-500 to-purple-500', icon: '⛰️' },
    { name: 'Khopoli', color: 'from-pink-500 to-rose-500', icon: '🏞️' },
  ];

  const amenitiesHighlight = [
    { icon: Waves, title: 'Private Pools', description: 'Exclusive swimming pools', color: 'from-blue-500 to-cyan-500' },
    { icon: UtensilsCrossed, title: 'Gourmet Chef', description: 'Professional chefs', color: 'from-orange-500 to-red-500' },
    { icon: Wifi, title: 'High-Speed WiFi', description: 'Stay connected', color: 'from-purple-500 to-pink-500' },
    { icon: Car, title: 'Free Parking', description: 'Secure parking', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      <section className="relative h-[600px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Premium Luxury Villas
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg" data-testid="hero-title">
            Find Your Perfect Getaway
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 drop-shadow-md" data-testid="hero-subtitle">
            Curated luxury villas and bungalows for your dream staycation
          </p>

          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm" data-testid="search-box">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-left text-purple-700">Location</label>
                  <Select value={searchData.location} onValueChange={(val) => setSearchData({...searchData, location: val})}>
                    <SelectTrigger data-testid="search-location" className="border-purple-200">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {popularLocations.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>{loc.icon} {loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left text-purple-700">Check-in</label>
                  <Input 
                    type="date" 
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    data-testid="search-checkin"
                    className="border-purple-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left text-purple-700">Check-out</label>
                  <Input 
                    type="date" 
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    data-testid="search-checkout"
                    className="border-purple-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-left text-purple-700">Guests</label>
                  <Select value={searchData.guests} onValueChange={(val) => setSearchData({...searchData, guests: val})}>
                    <SelectTrigger data-testid="search-guests" className="border-purple-200">
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
              <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" size="lg" onClick={handleSearch} data-testid="search-button">
                <Search className="mr-2 h-5 w-5" />
                Search Luxury Villas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50" data-testid="popular-locations">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Popular Destinations</h2>
            <p className="text-slate-600 text-lg">Discover luxury villas in these amazing locations</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularLocations.map((location) => (
              <Link href={`/villas?location=${location.name}`} key={location.name}>
                <Card className={`hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br ${location.color} transform hover:scale-105`} data-testid={`location-card-${location.name.toLowerCase()}`}>
                  <CardContent className="text-center p-6 text-white">
                    <div className="text-4xl mb-2">{location.icon}</div>
                    <h3 className="font-bold text-lg">{location.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featuredVillas.length > 0 && (
        <section className="py-16 bg-white" data-testid="featured-villas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Featured Luxury Villas</h2>
              <p className="text-slate-600 text-lg">Handpicked properties just for you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVillas.map((villa, idx) => {
                const gradients = ['from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500'];
                return (
                  <Card key={villa.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 transform hover:scale-105" data-testid={`featured-villa-${villa.slug}`}>
                    <div className={`h-3 bg-gradient-to-r ${gradients[idx % 3]}`}></div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={`mb-2 bg-gradient-to-r ${gradients[idx % 3]} border-0`}>
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                          <h3 className="text-xl font-bold">{villa.name}</h3>
                          <p className="text-slate-600 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1 text-pink-500" />
                            {villa.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${gradients[idx % 3]} bg-clip-text text-transparent`}>₹{villa.pricePerNight?.toLocaleString()}</div>
                          <div className="text-sm text-slate-600">per night</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 line-clamp-2">{villa.description}</p>
                      <div className="flex gap-4 mt-4 text-sm text-slate-600">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{villa.bedrooms} Bedrooms</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{villa.maxGuests} Guests</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/villa/${villa.slug}`} className="w-full">
                        <Button className={`w-full bg-gradient-to-r ${gradients[idx % 3]} hover:opacity-90 text-white shadow-lg`} data-testid={`view-villa-${villa.slug}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/villas">
                <Button variant="outline" size="lg" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50" data-testid="view-all-villas">
                  View All Villas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white relative overflow-hidden" data-testid="amenities-section">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Premium Amenities</h2>
            <p className="text-white/90 text-lg drop-shadow-md">Experience luxury like never before</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenitiesHighlight.map((amenity, idx) => (
              <div key={idx} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105" data-testid={`amenity-${idx}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${amenity.color} rounded-full mb-4 shadow-lg`}>
                  <amenity.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                <p className="text-white/80">{amenity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50" data-testid="cta-section">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Own a Luxury Villa?</h2>
              <p className="text-xl mb-8 text-white/90 drop-shadow-md">
                Partner with us and showcase your property to thousands of travelers
              </p>
              <Link href="/partner">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6" data-testid="partner-cta-button">
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
