import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'About Us - Curated Luxury Villa Stays',
  description: 'Learn about Malle Stays, our story, and our promise of verified luxury villas, transparent pricing and 24/7 guest support across Maharashtra.',
  alternates: { canonical: `${seoConfig.siteUrl}/about` },
  openGraph: { title: 'About Malle Stays', url: `${seoConfig.siteUrl}/about`, type: 'website' },
};

export default function AboutLayout({ children }) {
  return children;
}
