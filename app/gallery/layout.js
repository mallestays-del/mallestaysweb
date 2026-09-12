import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Villa Gallery - Pools, Interiors & Views',
  description: 'Explore photos of our luxury villas - private pools, designer interiors, gardens and scenic views across Lonavala, Alibaug, Karjat and more.',
  alternates: { canonical: `${seoConfig.siteUrl}/gallery` },
  openGraph: { title: 'Malle Stays Villa Gallery', url: `${seoConfig.siteUrl}/gallery`, type: 'website' },
};

export default function GalleryLayout({ children }) {
  return children;
}
