import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Toaster } from '@/components/ui/sonner';
import { seoConfig, generateStructuredData } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: '%s | Malle Stays'
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.keywords.join(', '),
  authors: [{ name: 'Malle Stays' }],
  creator: 'Malle Stays',
  publisher: 'Malle Stays',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: seoConfig.siteUrl,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: seoConfig.siteName,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Malle Stays - Luxury Villa Rentals',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    site: '@MalleStays',
    creator: '@MalleStays',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: seoConfig.siteUrl,
  },
};

export default function RootLayout({ children }) {
  const organizationSchema = generateStructuredData('organization');

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <link rel="canonical" href={seoConfig.siteUrl} />
      </head>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
        <ChatBot />
        <Toaster />
      </body>
    </html>
  );
}
