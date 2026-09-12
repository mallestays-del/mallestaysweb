'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, ArrowRight, Waves, UtensilsCrossed, Wifi, Car, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SchemaMarkup from '@/components/SchemaMarkup';
import { generateOrganizationSchema, generateWebsiteSchema, generateLocalBusinessSchema, generateReviewSchema } from '@/lib/schema';

export default function HomePage() {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });
  const [featuredVillas, setFeaturedVillas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const heroSearchRef = useRef(null);

  useEffect(() => {
    fetchFeaturedVillas();
    fetchGuestReviews();
    fetchActiveOffers();

    // Check for hash in URL to scroll to section
    if (window.location.hash === '#reviews' || window.location.hash === '#guest-reviews') {
      setTimeout(() => {
        const reviewsSection = document.querySelector('[data-testid="reviews-section"]');
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }

    // Sticky search bar on scroll
    const handleScroll = () => {
      if (heroSearchRef.current) {
        const heroRect = heroSearchRef.current.getBoundingClientRect();
        setIsSearchSticky(heroRect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Poll for new reviews every 30 seconds (real-time updates)
    const reviewInterval = setInterval(() => {
      fetchGuestReviews();
    }, 30000);

    return () => {
      clearInterval(reviewInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchGuestReviews = async () => {
    try {
      const response = await fetch('/api/guest-reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchFeaturedVillas = async () => {
    try {
      const response = await fetch('/api/villas?limit=3');
      const data = await response.json();
      setFeaturedVillas(data.villas?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const fetchActiveOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      const data = await response.json();
      setOffers((data.offers || []).filter(o => o.showOnHomepage));
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.guests) params.append('guests', searchData.guests);
    window.location.href = `/villas?${params.toString()}`;
  };

  const getOfferBannerColor = (color) => {
    const colors = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      red: 'bg-gradient-to-r from-red-500 to-red-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600'
    };
    return colors[color] || colors.blue;
  };

  const popularLocations = [
    { name: 'Lonavala', image: 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=400' },
    { name: 'Alibaug', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
    { name: 'Karjat', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
    { name: 'Igatpuri', image: 'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?w=400' },
    { name: 'Neral', image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=400' },
    { name: 'Khopoli', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' },
    { name: 'Badlapur', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
  ];

  const amenitiesHighlight = [
    { icon: Waves, title: 'Private Pools', description: 'Exclusive infinity pools with stunning views' },
    { icon: UtensilsCrossed, title: 'Gourmet Dining', description: 'Personal chef with exquisite cuisine' },
    { icon: Wifi, title: 'Premium WiFi', description: 'High-speed connectivity throughout' },
    { icon: Award, title: 'Concierge Service', description: '24/7 personalized assistance' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Schema Markup for SEO */}
      <SchemaMarkup schema={generateOrganizationSchema()} />
      <SchemaMarkup schema={generateWebsiteSchema()} />
      <SchemaMarkup schema={generateLocalBusinessSchema()} />
      {reviews.length > 0 && <SchemaMarkup schema={generateReviewSchema(reviews)} />}

      {/* Sticky Search Bar - appears on scroll */}
      {isSearchSticky && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 py-3 animate-in slide-in-from-top">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-4 gap-3">
                <Select value={searchData.location} onValueChange={(val) => setSearchData({...searchData, location: val})}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Destinations</SelectItem>
                    {popularLocations.map(loc => (
                      <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="date" 
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  className="h-10 text-sm"
                  placeholder="Check-in"
                />
                <Input 
                  type="date" 
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  className="h-10 text-sm"
                  placeholder="Check-out"
                />
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="Guests"
                  value={searchData.guests}
                  onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                  className="h-10 text-sm"
                />
              </div>
              <Button 
                className="bg-slate-900 hover:bg-slate-800 h-10 px-6" 
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        ref={heroSearchRef}
        className="relative h-[500px] md:h-[700px] bg-cover bg-center flex items-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600')`,
          backgroundAttachment: 'scroll'
        }}
        data-testid="hero-section"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4 md:mb-6 px-4 md:px-6 py-2 border border-yellow-600/30 rounded-full backdrop-blur-sm">
            <span className="text-yellow-600 font-medium tracking-wider text-xs md:text-sm uppercase flex items-center gap-2">
              <Award className="h-3 w-3 md:h-4 md:w-4" />
              Curated Luxury Experiences
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 text-white px-4" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="hero-title">
            Discover Your Perfect
            <span className="block luxury-text mt-2">Luxury Retreat</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl mb-8 md:mb-12 text-slate-300 max-w-3xl mx-auto font-light px-4" data-testid="hero-subtitle">
            Exclusive collection of premium villas and estates for discerning travelers
          </p>

          <Card className="max-w-5xl mx-auto elegant-shadow bg-white/95 backdrop-blur-md border-0" data-testid="search-box">
            <CardContent className="p-4 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div>
                  <label className="text-xs md:text-sm font-semibold mb-2 md:mb-3 block text-slate-700 uppercase tracking-wide">Location</label>
                  <Select value={searchData.location} onValueChange={(val) => setSearchData({...searchData, location: val})}>
                    <SelectTrigger data-testid="search-location" className="h-11 md:h-12 border-slate-300 text-sm md:text-base">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Destinations</SelectItem>
                      {popularLocations.map(loc => (
                        <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-semibold mb-2 md:mb-3 block text-slate-700 uppercase tracking-wide">Check-in</label>
                  <Input 
                    type="date" 
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    data-testid="search-checkin"
                    className="h-11 md:h-12 border-slate-300 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-semibold mb-2 md:mb-3 block text-slate-700 uppercase tracking-wide">Check-out</label>
                  <Input 
                    type="date" 
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    data-testid="search-checkout"
                    className="h-11 md:h-12 border-slate-300 text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-semibold mb-2 md:mb-3 block text-slate-700 uppercase tracking-wide">Guests</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="100"
                    placeholder="Number of guests"
                    value={searchData.guests}
                    onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                    data-testid="search-guests"
                    className="h-12 border-slate-300"
                  />
                </div>
              </div>
              <Button 
                className="w-full mt-6 h-14 bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold tracking-wide uppercase" 
                onClick={handleSearch} 
                data-testid="search-button"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Premium Villas
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Active Offers Banner */}
      {offers.length > 0 && (
        <section className="py-4 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offers.slice(0, 3).map((offer, idx) => (
                <div 
                  key={idx}
                  className={`${getOfferBannerColor(offer.bannerColor)} text-white rounded-lg p-4 shadow-lg transform hover:scale-105 transition-transform cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                      <p className="text-sm opacity-90">{offer.description}</p>
                      {offer.couponCode && (
                        <div className="mt-2 inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-xs font-mono font-bold">Code: {offer.couponCode}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Villa Categories */}
      <section className="py-20 bg-white" data-testid="villa-categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Collections</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Villa Categories
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Discover your perfect escape - from serene mountains to pristine beaches
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Link href="/villas?category=Poolside Villa">
              <Card className="overflow-hidden elegant-shadow-hover border-0 group cursor-pointer h-full" data-testid="category-poolside">
                <div className="relative h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600" 
                    alt="Poolside Villa"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <Waves className="h-8 w-8 mb-3 text-yellow-600" />
                    <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Poolside Villas</h3>
                    <p className="text-slate-300 text-sm">Private infinity pools with stunning views</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/villas?category=Beach Villa">
              <Card className="overflow-hidden elegant-shadow-hover border-0 group cursor-pointer h-full" data-testid="category-beach">
                <div className="relative h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600" 
                    alt="Beach Villa"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                    </svg>
                    <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Beach Villas</h3>
                    <p className="text-slate-300 text-sm">Beachfront luxury with ocean views</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/villas?category=Mountain Villa">
              <Card className="overflow-hidden elegant-shadow-hover border-0 group cursor-pointer h-full" data-testid="category-mountain">
                <div className="relative h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600" 
                    alt="Mountain Villa"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                    </svg>
                    <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Mountain Villas</h3>
                    <p className="text-slate-300 text-sm">Serene retreats in the hills</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/villas?category=Farmhouse Villa">
              <Card className="overflow-hidden elegant-shadow-hover border-0 group cursor-pointer h-full" data-testid="category-farmhouse">
                <div className="relative h-64">
                  <img 
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600" 
                    alt="Farmhouse Villa"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 13h18"/>
                      <path d="m3 17 3 3 3-3"/>
                      <path d="m15 17 3 3 3-3"/>
                      <path d="M6 9h.01"/>
                      <path d="M10 9h.01"/>
                      <path d="M14 9h.01"/>
                      <path d="M18 9h.01"/>
                      <path d="M12 2 2 7l10 5 10-5-10-5z"/>
                    </svg>
                    <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Farmhouse Villas</h3>
                    <p className="text-slate-300 text-sm">Rustic charm with modern luxury</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Pick a Property Section with Carousel */}
      <section className="py-20 bg-white" data-testid="property-carousel">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Handpicked for You</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pick a property that suits your taste
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Discover our curated collection of luxury villas perfect for your next getaway
            </p>
          </div>

          {/* Carousel */}
          <div className="relative max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVillas.map((villa) => (
                <Card key={villa.id} className="overflow-hidden elegant-shadow-hover border-0 group" data-testid={`carousel-villa-${villa.slug}`}>
                  <div className="relative h-64">
                    <img 
                      src={villa.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'} 
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-600 text-white px-3 py-1">
                        ₹{villa.pricePerNight?.toLocaleString()}/night
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {villa.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{villa.location}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                      {villa.description}
                    </p>
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-600">
                      <span>{villa.bedrooms} Bedrooms</span>
                      <span>•</span>
                      <span>Up to {villa.maxGuests} Guests</span>
                    </div>
                    <Link href={`/villa/${villa.slug}`} className="w-full">
                      <Button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white">
                        View & Book →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {featuredVillas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No properties available at the moment</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link href="/villas">
              <Button variant="outline" size="lg" className="px-8" data-testid="view-all-properties">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-20 bg-slate-50" data-testid="popular-locations">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Destinations</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Prestigious Locations
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Explore our handpicked luxury estates in India's most sought-after destinations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularLocations.map((location) => (
              <Link href={`/villas?location=${location.name}`} key={location.name}>
                <Card className="overflow-hidden elegant-shadow-hover border-0 group cursor-pointer" data-testid={`location-card-${location.name.toLowerCase()}`}>
                  <div className="relative h-48">
                    <img 
                      src={location.image} 
                      alt={location.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg text-center">{location.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Villas */}
      {featuredVillas.length > 0 && (
        <section className="py-20 bg-white" data-testid="featured-villas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Featured Collection</p>
              <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Signature Properties
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Meticulously curated luxury villas offering unparalleled comfort and elegance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVillas.map((villa) => (
                <Card key={villa.id} className="overflow-hidden elegant-shadow-hover border-0 group" data-testid={`featured-villa-${villa.slug}`}>
                  <div className="relative h-80">
                    <img 
                      src={villa.images?.[0] || 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800'} 
                      alt={villa.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-yellow-600 hover:bg-yellow-700 border-0 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{villa.name}</h3>
                        <p className="text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-yellow-600" />
                          {villa.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{villa.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b">
                      <span>{villa.bedrooms} Bedrooms</span>
                      <span>•</span>
                      <span>{villa.maxGuests} Guests</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-3xl font-bold text-slate-900">₹{villa.pricePerNight?.toLocaleString()}</span>
                        <span className="text-slate-600 text-sm ml-2">/ night</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Link href={`/villa/${villa.slug}`} className="w-full">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base font-semibold" data-testid={`view-villa-${villa.slug}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/villas">
                <Button variant="outline" size="lg" className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white h-12 px-8 text-base font-semibold" data-testid="view-all-villas">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Amenities */}
      <section className="py-20 bg-slate-50" data-testid="amenities-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Features</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Premium Amenities
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Every detail crafted for your ultimate comfort and luxury
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenitiesHighlight.map((amenity, idx) => (
              <Card key={idx} className="border-0 elegant-shadow-hover overflow-hidden group" data-testid={`amenity-${idx}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-yellow-600/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 transition-colors duration-300">
                      <amenity.icon className="h-7 w-7 text-yellow-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-slate-900">{amenity.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{amenity.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews Section */}
      <section className="py-20 bg-white" data-testid="reviews-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Testimonials</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              What Our Guests Say
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Real experiences from our valued guests who have stayed at our premium villas
            </p>
          </div>

          {/* Reviews Grid - Dynamic from Database - REAL USER IMAGES ONLY */}
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {reviews.map((review) => (
                <Card key={review.id} className="elegant-shadow-hover border-0 overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="relative h-[400px] overflow-hidden bg-slate-200">
                      {review.imageUrl ? (
                        <img
                          src={review.imageUrl}
                          alt={`Review by ${review.guestName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.error('❌ Failed to load review image:', review.imageUrl);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-slate-100"><p class="text-slate-500 text-sm px-4 text-center">Image not available</p></div>';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-slate-100">
                          <p className="text-slate-500 text-sm px-4 text-center">No image uploaded</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm italic mb-3">
                          "{review.reviewText}"
                        </p>
                        <p className="text-sm font-semibold">- {review.guestName}</p>
                        <p className="text-xs text-slate-300">{review.location}</p>
                      </div>
                      <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {review.source || 'Review'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No reviews yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Curated Collections - StayVista Style */}
      <section className="py-20 bg-white" data-testid="curated-collections">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">Curated For You</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Explore By Experience
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Find the perfect villa for every occasion and mood
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Pool Villas', emoji: '🏊', desc: 'Private pools for ultimate relaxation', query: 'pool' },
              { title: 'Pet-Friendly', emoji: '🐾', desc: 'Bring your furry friends along', query: 'pet' },
              { title: 'Celebrations', emoji: '🎉', desc: 'Birthdays, anniversaries & parties', query: 'celebration' },
              { title: 'Weekend Getaways', emoji: '🌄', desc: 'Quick escapes from the city', query: 'weekend' },
              { title: 'Family Retreats', emoji: '👨‍👩‍👧‍👦', desc: 'Spacious villas for families', query: 'family' },
              { title: 'Couple Stays', emoji: '💑', desc: 'Romantic and private', query: 'couple' },
              { title: 'Corporate Offsites', emoji: '💼', desc: 'Team building & work retreats', query: 'corporate' },
              { title: 'Luxury Escapes', emoji: '✨', desc: 'Premium & exclusive properties', query: 'luxury' },
            ].map((collection, idx) => (
              <Link href={`/villas?tag=${collection.query}`} key={idx}>
                <Card className="border border-slate-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{collection.emoji}</div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-yellow-700 transition-colors">{collection.title}</h3>
                    <p className="text-xs text-slate-500">{collection.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="py-8 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">Need Help Planning Your Stay?</h3>
              <p className="text-slate-400 text-sm">Our concierge team is available 9 AM - 10 PM, all days</p>
            </div>
            <div className="flex gap-4">
              <a href="tel:+918446620191" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 8446620191
              </a>
              <a href="mailto:connect@mallestays.com" className="flex items-center gap-2 border border-white/30 hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                connect@mallestays.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50" data-testid="faq-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-yellow-600 font-semibold tracking-wider uppercase text-sm mb-3">FAQs</p>
            <h2 className="text-5xl font-bold mb-4 text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How do I book a villa?', a: 'Simply browse our villas, select your dates and guests, and proceed to checkout. You can pay 20% advance to lock your booking or pay the full amount.' },
              { q: 'What is the cancellation policy?', a: 'Free cancellation up to 7 days before check-in for a full refund. Cancellations within 7 days may attract charges. Please refer to our Terms & Conditions.' },
              { q: 'Is there a security deposit?', a: 'Yes, a refundable security deposit of ₹2,000-₹5,000 is collected at check-in and returned at checkout after property inspection.' },
              { q: 'What time is check-in and check-out?', a: 'Standard check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in or late checkout may be available on request.' },
              { q: 'Are pets allowed?', a: 'Some of our properties are pet-friendly. Please check the villa details or contact us to confirm before booking.' },
              { q: 'Do you provide food/catering?', a: 'Most villas have fully equipped kitchens. Some properties offer cook services at additional cost. BBQ setups are available at select villas.' },
              { q: 'Can I book for a party or event?', a: 'Yes! Many of our villas are perfect for birthdays, anniversaries, and small gatherings. Please inform us in advance for party bookings.' },
            ].map((faq, idx) => (
              <details key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="p-6 cursor-pointer font-semibold text-slate-900 hover:text-yellow-700 transition-colors flex items-center justify-between">
                  {faq.q}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50" data-testid="cta-section">
        <div className="container mx-auto px-4">
          <Card className="elegant-shadow border-0 overflow-hidden">
            <div className="bg-slate-900 text-white p-16 text-center">
              <Award className="h-16 w-16 mx-auto mb-6 text-yellow-600" />
              <h2 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                List Your Property
              </h2>
              <p className="text-xl mb-8 text-slate-300 max-w-2xl mx-auto">
                Join our exclusive collection and showcase your luxury property to discerning travelers worldwide
              </p>
              <Link href="/partner">
                <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white h-14 px-10 text-base font-semibold tracking-wide" data-testid="partner-cta-button">
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
