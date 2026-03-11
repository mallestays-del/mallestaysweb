'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddVillaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    description: '',
    pricePerNight: '',
    bedrooms: '2',
    maxGuests: '4',
    amenities: [],
    images: [],
    mapLocation: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/villas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Villa created successfully!');
        router.push('/admin');
      } else {
        toast.error(data.error || 'Failed to create villa');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  const locations = ['Lonavala', 'Alibaug', 'Karjat', 'Igatpuri', 'Neral', 'Khopoli', 'Badlapur'];

  return (
    <div className="min-h-screen bg-slate-50 py-8" data-testid="add-villa-page">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" data-testid="back-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Villa</CardTitle>
            <CardDescription>Fill in the details to add a new luxury villa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">Villa Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Serenity Villa"
                    required
                    data-testid="villa-name-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location *</label>
                  <Select value={formData.location} onValueChange={(val) => setFormData({ ...formData, location: val })} required>
                    <SelectTrigger data-testid="villa-location-select">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })} required>
                    <SelectTrigger data-testid="villa-category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poolside Villa">Poolside Villa</SelectItem>
                      <SelectItem value="Beach Villa">Beach Villa</SelectItem>
                      <SelectItem value="Mountain Villa">Mountain Villa</SelectItem>
                      <SelectItem value="Farmhouse Villa">Farmhouse Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the villa..."
                    rows={5}
                    required
                    data-testid="villa-description-input"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Per Night (₹) *</label>
                    <Input
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                      placeholder="15000"
                      required
                      data-testid="villa-price-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bedrooms *</label>
                    <Select value={formData.bedrooms} onValueChange={(val) => setFormData({ ...formData, bedrooms: val })}>
                      <SelectTrigger data-testid="villa-bedrooms-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Guests *</label>
                    <Select value={formData.maxGuests} onValueChange={(val) => setFormData({ ...formData, maxGuests: val })}>
                      <SelectTrigger data-testid="villa-guests-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="flex space-x-2">
                  <Input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="e.g., Private Pool"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    data-testid="amenity-input"
                  />
                  <Button type="button" onClick={addAmenity} data-testid="add-amenity-button">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center space-x-2">
                      <span>{amenity}</span>
                      <button type="button" onClick={() => removeAmenity(index)} className="text-red-500">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images (URL)</h3>
                <p className="text-sm text-slate-600">Note: For now, add image URLs. Real image upload will be available soon.</p>
                <div className="flex space-x-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    data-testid="image-input"
                  />
                  <Button type="button" onClick={addImage} data-testid="add-image-button">
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image} alt="Villa" className="w-full h-32 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO Settings (Optional)</h3>
                <div>
                  <label className="text-sm font-medium mb-2 block">SEO Title</label>
                  <Input
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Auto-generated from villa name"
                    data-testid="seo-title-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">SEO Description</label>
                  <Textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Auto-generated from description"
                    rows={3}
                    data-testid="seo-description-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">SEO Keywords</label>
                  <Input
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="luxury villa, vacation, lonavala"
                    data-testid="seo-keywords-input"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/admin">
                  <Button type="button" variant="outline" data-testid="cancel-button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading} data-testid="submit-button">
                  {loading ? 'Creating...' : 'Create Villa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
