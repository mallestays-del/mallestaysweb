'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Users, Bed, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function VillasPage() {
  const searchParams = useSearchParams();
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || 'all',
    category: searchParams.get('category') || 'all',
    minPrice: '',
    maxPrice: '',
    guests: searchParams.get('guests') || '',
    bedrooms: ''
  });

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location && filters.location !== 'all') params.append('location', filters.location);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.guests) params.append('guests', filters.guests);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);

      const response = await fetch(`/api/villas?${params.toString()}`);
      const data = await response.json();
      setVillas(data.villas || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    } finally {
      setLoading(false);
    }
  };

  const locations = ['Lonavala', 'Alibaug', 'Karjat', 'Igatpuri', 'Neral', 'Khopoli', 'Badlapur'];
  const categories = ['Poolside Villa', 'Beach Villa', 'Mountain Villa', 'Farmhouse Villa'];

  const FilterContent = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Location</label>
        <Select value={filters.location} onValueChange={(val) => setFilters({ ...filters, location: val })}>
          <SelectTrigger data-testid="filter-location">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Min Price (₹)</label>
        <Input
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          placeholder="e.g., 5000"
          data-testid="filter-min-price"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Max Price (₹)</label>
        <Input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          placeholder="e.g., 25000"
          data-testid="filter-max-price"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Guests</label>
        <Select value={filters.guests} onValueChange={(val) => setFilters({ ...filters, guests: val })}>
          <SelectTrigger data-testid="filter-guests">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            {[2, 4, 6, 8, 10].map(num => (
              <SelectItem key={num} value={num.toString()}>{num}+ Guests</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Bedrooms</label>
        <Select value={filters.bedrooms} onValueChange={(val) => setFilters({ ...filters, bedrooms: val })}>
          <SelectTrigger data-testid="filter-bedrooms">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <SelectItem key={num} value={num.toString()}>{num}+ Bedrooms</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={fetchVillas} data-testid="apply-filters-button">
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" data-testid="villas-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Luxury Villas</h1>
          <p className="text-slate-600">Find your perfect getaway from our curated collection</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0" data-testid="desktop-filters">
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Filters</h2>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden fixed bottom-4 right-4 z-40" data-testid="mobile-filter-button">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="rounded-full shadow-lg">
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Villas Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12" data-testid="loading-spinner">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Loading villas...</p>
              </div>
            ) : villas.length === 0 ? (
              <Card className="p-12 text-center" data-testid="no-villas">
                <p className="text-xl text-slate-600 mb-4">No villas found matching your criteria</p>
                <p className="text-slate-500">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="villas-grid">
                {villas.map((villa) => (
                  <Card key={villa.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`villa-card-${villa.slug}`}>
                    <div className="relative h-64">
                      <img
                        src={villa.images?.[0] || 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85'}
                        alt={villa.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                        <span className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {villa.bedrooms} Beds
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {villa.maxGuests} Guests
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/villa/${villa.slug}`} className="w-full">
                        <Button className="w-full" data-testid={`view-details-${villa.slug}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
