'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage guest reviews section
    router.push('/#reviews');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to Guest Reviews...</p>
      </div>
    </div>
  );
}

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      // Only show approved reviews
      setReviews(data.reviews?.filter(r => r.approved) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/villas');
      const data = await response.json();
      setVillas(data.villas || []);
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Review submitted for approval! It will be visible once approved.');
        setFormData({ villaId: '', villaName: '', name: '', rating: '5', comment: '' });
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
      />
    ));
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="reviews-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Guest Reviews</h1>
          <p className="text-slate-600 text-lg">See what our guests say about their stays</p>
          {reviews.length > 0 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-2xl font-bold">{averageRating}</span>
              <span className="text-slate-600">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6" data-testid="reviews-list">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-slate-600 mb-4">No reviews yet</p>
                <p className="text-slate-500">Be the first to share your experience!</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} data-testid={`review-${review.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{review.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">{review.villaName}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{review.comment}</p>
                    <p className="text-sm text-slate-400 mt-4">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Submit Review Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20" data-testid="review-form">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>Share your experience with us</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Villa *</label>
                    <Select
                      value={formData.villaId}
                      onValueChange={(val) => {
                        const villa = villas.find(v => v.id === val);
                        setFormData({ ...formData, villaId: val, villaName: villa?.name || '' });
                      }}
                      required
                    >
                      <SelectTrigger data-testid="villa-select">
                        <SelectValue placeholder="Choose a villa" />
                      </SelectTrigger>
                      <SelectContent>
                        {villas.map((villa) => (
                          <SelectItem key={villa.id} value={villa.id}>{villa.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                      data-testid="name-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating *</label>
                    <Select value={formData.rating} onValueChange={(val) => setFormData({ ...formData, rating: val })}>
                      <SelectTrigger data-testid="rating-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Star{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Review *</label>
                    <Textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Share your experience..."
                      rows={5}
                      required
                      data-testid="comment-input"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-review-button">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <p className="text-xs text-center text-slate-600">
                    Your review will be published after approval
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
