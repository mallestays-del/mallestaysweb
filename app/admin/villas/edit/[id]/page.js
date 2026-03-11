'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';

export default function EditVilla() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingVilla, setFetchingVilla] = useState(true);
  const [imageUrls, setImageUrls] = useState(['']);
  const [amenities, setAmenities] = useState(['']);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    category: '',
    pricePerNight: '',
    bedrooms: '',
    maxGuests: '',
    images: [],
    amenities: []
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && params.id) {
      fetchVilla();
    }
  }, [status, params.id]);

  const fetchVilla = async () => {
    try {
      const response = await fetch(`/api/admin/villas/${params.id}`);
      if (!response.ok) {
        toast.error('Villa not found');
        router.push('/admin/dashboard');
        return;
      }

      const data = await response.json();
      const villa = data.villa;

      setFormData({
        name: villa.name || '',
        location: villa.location || '',
        description: villa.description || '',
        category: villa.category || '',
        pricePerNight: villa.pricePerNight || '',
        bedrooms: villa.bedrooms || '',
        maxGuests: villa.maxGuests || '',
        images: villa.images || [],
        amenities: villa.amenities || []
      });

      setImageUrls(villa.images?.length > 0 ? villa.images : ['']);
      setAmenities(villa.amenities?.length > 0 ? villa.amenities : ['']);
    } catch (error) {
      console.error('Error fetching villa:', error);
      toast.error('Failed to load villa data');
    } finally {
      setFetchingVilla(false);
    }
  };

  const addAmenity = () => {
    setAmenities([...amenities, '']);
  };

  const removeAmenity = (index) => {
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities.length > 0 ? newAmenities : ['']);
  };

  const updateAmenity = (index, value) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty strings
      const validImages = imageUrls.filter(url => url.trim() !== '');
      const validAmenities = amenities.filter(amenity => amenity.trim() !== '');

      if (validImages.length === 0) {
        toast.error('Please add at least one image');
        setLoading(false);
        return;
      }

      const villaData = {
        ...formData,
        images: validImages,
        amenities: validAmenities,
        pricePerNight: Number(formData.pricePerNight),
        bedrooms: Number(formData.bedrooms),
        maxGuests: Number(formData.maxGuests)
      };

      const response = await fetch(`/api/admin/villas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(villaData)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Villa updated successfully!');
        router.push('/admin/dashboard');
      } else {
        toast.error(data.error || 'Failed to update villa');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this villa? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/villas/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Villa deleted successfully');
        router.push('/admin/dashboard');
      } else {
        toast.error('Failed to delete villa');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (status === 'loading' || fetchingVilla) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading villa details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Edit Villa</h1>
              <p className="text-slate-600 mt-1">Update villa details and save changes</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Villa
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Edit the main details of the villa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Villa Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Azure Villa, Serenity Villa"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Lonavala, Alibaug, Karjat"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter the city or area name</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Beach Villa">Beach Villa</option>
                    <option value="Poolside Villa">Poolside Villa</option>
                    <option value="Mountain Villa">Mountain Villa</option>
                    <option value="Lake Villa">Lake Villa</option>
                    <option value="Garden Villa">Garden Villa</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the villa, its unique features, and what makes it special..."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Capacity</CardTitle>
                <CardDescription>Update pricing and guest capacity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Per Night (₹) *</label>
                    <Input
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                      placeholder="15000"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Bedrooms *</label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="3"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Maximum Guests *</label>
                    <Input
                      type="number"
                      value={formData.maxGuests}
                      onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                      placeholder="6"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Villa Images</CardTitle>
                <CardDescription>Update images - upload files or add URLs</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="image/*,.pdf"
                  multiple={true}
                  label="Villa Images"
                  onFilesChange={(files) => {
                    const imageData = files.map(file => {
                      if (typeof file === 'string') {
                        return file;
                      } else if (file.data) {
                        return file.data;
                      }
                      return file;
                    });
                    setImageUrls(imageData);
                  }}
                />
                {/* Show current images */}
                {formData.images?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`Villa ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>Update all the amenities available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={amenity}
                      onChange={(e) => updateAmenity(index, e.target.value)}
                      placeholder="e.g., Private Pool, WiFi, Chef, Parking"
                      className="flex-1"
                    />
                    {amenities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAmenity(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addAmenity} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Amenity
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating Villa...' : 'Update Villa'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
