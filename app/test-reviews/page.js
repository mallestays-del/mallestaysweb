'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestReviewPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAddReview = async () => {
    setLoading(true);
    try {
      const testReview = {
        guestName: "Test Guest",
        location: "Mumbai",
        reviewText: "Amazing villa! Had a wonderful stay with family. Highly recommended!",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=600&h=800&fit=crop",
        source: "WhatsApp Review"
      };

      const response = await fetch('/api/admin/guest-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReview)
      });

      const data = await response.json();
      setResult({ success: response.ok, data });
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testFetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/guest-reviews');
      const data = await response.json();
      setResult({ success: response.ok, data });
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Guest Reviews System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-x-4">
              <Button onClick={testAddReview} disabled={loading}>
                Test Add Review
              </Button>
              <Button onClick={testFetchReviews} disabled={loading} variant="outline">
                Test Fetch Reviews
              </Button>
              <Button onClick={() => window.open('/#reviews', '_blank')} variant="outline">
                View Homepage Reviews
              </Button>
            </div>

            {loading && <p>Loading...</p>}

            {result && (
              <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
