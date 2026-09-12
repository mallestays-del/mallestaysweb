import { seoConfig } from '@/lib/seo';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Malle Stays collects, uses and protects your personal information when you browse or book with us.',
  alternates: { canonical: `${seoConfig.siteUrl}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }) {
  return children;
}
