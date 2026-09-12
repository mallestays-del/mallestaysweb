import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Partner With Us - List Your Villa',
  description: 'Own a villa or holiday home? Partner with Malle Stays to reach premium guests, get professional listing support and maximise your rental income.',
  alternates: { canonical: `${seoConfig.siteUrl}/partner` },
  openGraph: { title: 'List Your Villa with Malle Stays', url: `${seoConfig.siteUrl}/partner`, type: 'website' },
};

export default function PartnerLayout({ children }) {
  return children;
}
