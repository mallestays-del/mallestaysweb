import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Luxury Villas for Rent in Lonavala, Alibaug, Karjat & More',
  description: 'Browse handpicked private pool villas and vacation homes near Mumbai & Pune. Filter by location, price, guests and amenities. Book securely with Malle Stays.',
  alternates: { canonical: `${seoConfig.siteUrl}/villas` },
  openGraph: {
    title: 'Luxury Villas for Rent | Malle Stays',
    description: 'Browse handpicked private pool villas and vacation homes near Mumbai & Pune.',
    url: `${seoConfig.siteUrl}/villas`,
    type: 'website',
  },
};

export default function VillasLayout({ children }) {
  return children;
}
