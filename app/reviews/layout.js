import { seoConfig } from '@/lib/seo';

// /reviews client-redirects to the homepage reviews section, so point canonical home and keep it out of the index
export const metadata = {
  title: 'Guest Reviews & Ratings',
  description: 'Read verified guest reviews and ratings for Malle Stays luxury villas.',
  alternates: { canonical: `${seoConfig.siteUrl}/#reviews` },
  robots: { index: false, follow: true },
};

export default function ReviewsLayout({ children }) {
  return children;
}
