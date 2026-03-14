'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import FileUpload from '@/components/FileUpload';

export default function AddVilla() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(['']);
  const [amenities, setAmenities] = useState(['']);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    category: '',
    pricePerNight: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    parking: '',
    images: [],
    amenities: []
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status]);

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value || ''; // Ensure we never set null/undefined
    setImageUrls(newUrls);
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
    newAmenities[index] = value || ''; // Ensure we never set null/undefined
    setAmenities(newAmenities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty, null, or undefined values
      const validImages = imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
      const validAmenities = amenities.filter(amenity => amenity && typeof amenity === 'string' && amenity.trim() !== '');

      if (validImages.length === 0) {
        toast.error('Please add at least one image URL');
        setLoading(false);
        return;
      }

      const villaData = {
        ...formData,
        images: validImages,
        amenities: validAmenities,
        pricePerNight: Number(formData.pricePerNight),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        maxGuests: Number(formData.maxGuests),
        parking: Number(formData.parking)
      };

      console.log('Submitting villa data:', villaData);

      const response = await fetch('/api/admin/villas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(villaData)
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        toast.success('Villa added successfully!');
        router.push('/admin/dashboard');
      } else {
        // Show specific error message from server
        const errorMessage = data.error || data.message || 'Failed to add villa';
        console.error('Server error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting villa:', error);
      toast.error(`An error occurred: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
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
          <h1 className="text-3xl font-bold">Add New Villa</h1>
          <p className="text-slate-600 mt-1">Fill in the details to add a new property</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the main details of the villa</CardDescription>
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
                    <option value="Farmhouse Villa">Farmhouse Villa</option>
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
                <CardDescription>Set pricing and guest capacity</CardDescription>
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
                    <label className="text-sm font-medium mb-2 block">Number of Bathrooms *</label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="3"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">Parking Capacity *</label>
                    <Input
                      type="number"
                      value={formData.parking}
                      onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                      placeholder="3"
                      required
                      min="1"
                    />
                    <p className="text-xs text-slate-500 mt-1">Number of cars that can be parked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Villa Images</CardTitle>
                <CardDescription>Upload images or add image URLs (at least one required)</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="image/*,.pdf"
                  multiple={true}
                  label="Villa Images"
                  onFilesChange={(files) => {
                    // Handle both uploaded files and URLs
                    const imageData = files.map(file => {
                      if (typeof file === 'string') {
                        return file; // URL
                      } else if (file.data) {
                        return file.data; // Base64 from uploaded file
                      }
                      return file;
                    });
                    setImageUrls(imageData);
                  }}
                />
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>List all the amenities available</CardDescription>
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
                {loading ? 'Adding Villa...' : 'Add Villa'}
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
