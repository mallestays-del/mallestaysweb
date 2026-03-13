'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Star, Image as ImageIcon } from 'lucide-react';
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
        alert(editingReview ? 'Review updated successfully!' : 'Review added successfully!');
        setShowForm(false);
        setEditingReview(null);
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
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, imageUrl: data.url });
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image. Please try using URL instead.');
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        setFormData({ ...formData, imageUrl: tempUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. You can paste URL instead.');
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Guest Reviews Management</h1>
            <p className="text-slate-600 mt-2">Manage testimonials shown on the homepage</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>

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
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Paste the review screenshot URL here"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Upload your image to customer-assets and paste the URL here
                  </p>
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
                <div className="relative h-64">
                  <img
                    src={review.imageUrl}
                    alt={`Review by ${review.guestName}`}
                    className="w-full h-full object-cover"
                  />
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
