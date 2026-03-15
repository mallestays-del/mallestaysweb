'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Star, Image as ImageIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GuestReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    location: '',
    reviewText: '',
    rating: 5,
    imageUrl: '',
    source: 'WhatsApp Review'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/guest-reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate image is present
    if (!formData.imageUrl) {
      alert('Please upload an image or provide an image URL');
      return;
    }
    
    try {
      const url = editingReview 
        ? `/api/admin/guest-reviews/${editingReview.id}`
        : '/api/admin/guest-reviews';
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const successMessage = editingReview 
          ? 'Review updated successfully! Check homepage to see changes.' 
          : 'Review added successfully! It\'s now live on homepage!';
        
        if (window.confirm(`${successMessage}\n\nWould you like to view it on the homepage now?`)) {
          window.open('/#reviews', '_blank');
        }
        
        setShowForm(false);
        setEditingReview(null);
        setImageFile(null);
        setFormData({
          guestName: '',
          location: '',
          reviewText: '',
          rating: 5,
          imageUrl: '',
          source: 'WhatsApp Review'
        });
        fetchReviews();
      } else {
        alert('Failed to save review');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Error saving review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      guestName: review.guestName,
      location: review.location,
      reviewText: review.reviewText,
      rating: review.rating,
      imageUrl: review.imageUrl,
      source: review.source
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/admin/guest-reviews/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Review deleted successfully!');
        fetchReviews();
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
    setImageFile(null);
    setFormData({
      guestName: '',
      location: '',
      reviewText: '',
      rating: 5,
      imageUrl: '',
      source: 'WhatsApp Review'
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      console.log('📤 Uploading image:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      console.log('📥 Upload response:', data);

      if (response.ok && data.url) {
        setFormData({ ...formData, imageUrl: data.url });
        alert('✅ Image uploaded successfully! URL: ' + data.url);
        console.log('✅ Image ready to use:', data.url);
      } else {
        alert('❌ Upload failed: ' + (data.error || 'Unknown error'));
        console.error('Upload failed:', data);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Guest Reviews Management</h1>
            <p className="text-slate-600 mt-2">Manage testimonials shown on the homepage</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.open('/#reviews', '_blank')}
              variant="outline"
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Live on Homepage
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </div>
        </div>

        {/* Instructions Banner */}
        {!showForm && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-600 text-white rounded-full p-3 flex-shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-900 mb-3">📸 How to Upload Guest Review Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                      <h4 className="font-semibold text-slate-900">Take Screenshot</h4>
                    </div>
                    <p className="text-sm text-slate-600">Screenshot reviews from WhatsApp, Instagram, Google, or Facebook</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                      <h4 className="font-semibold text-slate-900">Click "Add Review"</h4>
                    </div>
                    <p className="text-sm text-slate-600">Click the yellow "Add Review" button above to open the form</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                      <h4 className="font-semibold text-slate-900">Upload & Publish</h4>
                    </div>
                    <p className="text-sm text-slate-600">Upload image file OR paste URL, fill details, and submit!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-900 bg-yellow-100 rounded-lg p-3">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">Reviews appear instantly on homepage under "What Our Guests Say" section</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Guest Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      placeholder="e.g., Rahul Mehta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Review Text</label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    placeholder="Write the guest's review here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Review Source</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    >
                      <option value="WhatsApp Review">WhatsApp Review</option>
                      <option value="Instagram Review">Instagram Review</option>
                      <option value="Google Review">Google Review</option>
                      <option value="Facebook Review">Facebook Review</option>
                      <option value="Email Review">Email Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <ImageIcon className="inline h-4 w-4 mr-1" />
                    Review Image *
                  </label>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        disabled={uploadingImage}
                        required
                      />
                      {uploadingImage && (
                        <div className="text-sm text-slate-500">Uploading...</div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: JPG, PNG, JPEG (Max 5MB)
                    </p>
                  </div>
                  
                  {!formData.imageUrl && !uploadingImage && (
                    <p className="text-sm text-red-500 mt-2">
                      * Please upload an image
                    </p>
                  )}
                </div>

                {/* Image Preview */}
                {formData.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Preview</label>
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-48 h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                    {editingReview ? 'Update Review' : 'Add Review'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 bg-slate-200">
                  {review.imageUrl ? (
                    <img
                      src={review.imageUrl}
                      alt={`Review by ${review.guestName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Admin: Failed to load image:', review.imageUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-slate-100"><p class="text-slate-500 text-xs">Image load failed</p></div>';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-100">
                      <p className="text-slate-500 text-xs">No image</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded-full text-xs">
                    {review.source}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 mb-3 italic line-clamp-3">
                    "{review.reviewText}"
                  </p>
                  <p className="text-sm font-semibold text-slate-900">- {review.guestName}</p>
                  <p className="text-xs text-slate-500">{review.location}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(review)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reviews.length === 0 && !showForm && (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No reviews yet</h3>
              <p className="text-slate-500 mb-6">Add your first guest review to get started</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
