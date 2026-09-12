import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Booking terms, cancellation policy, house rules and security deposit details for stays booked through Malle Stays.',
  alternates: { canonical: `${seoConfig.siteUrl}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }) {
  return children;
}
