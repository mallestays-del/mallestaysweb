import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Contact Us - Villa Booking Enquiries',
  description: 'Get in touch with Malle Stays for villa bookings, group stays and events. Call, WhatsApp or email us - we respond within hours.',
  alternates: { canonical: `${seoConfig.siteUrl}/contact` },
  openGraph: { title: 'Contact Malle Stays', url: `${seoConfig.siteUrl}/contact`, type: 'website' },
};

export default function ContactLayout({ children }) {
  return children;
}
