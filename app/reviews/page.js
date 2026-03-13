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
