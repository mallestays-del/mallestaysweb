// SEO utility functions and metadata generators

export const generateMetadata = (page, data = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mallestays.com';
  const siteName = 'Malle Stays';
  const defaultDescription = 'Discover luxury villa rentals in India. Premium vacation homes with world-class amenities, private pools, and personalized service. Book your dream getaway today.';
  const defaultImage = `${baseUrl}/og-image.jpg`;

  const metadata = {
    home: {
      title: 'Malle Stays - Luxury Villa Rentals in India | Premium Vacation Homes',
      description: defaultDescription,
      keywords: 'luxury villas india, vacation homes, villa rentals, premium villas, lonavala villas, mumbai villas, goa villas, private pool villas, luxury getaway',
      ogTitle: 'Malle Stays - Your Luxury Villa Retreat Awaits',
      ogDescription: 'Experience unparalleled luxury with our curated collection of premium villas across India. Perfect for families, celebrations, and corporate retreats.',
    },
    villas: {
      title: 'Luxury Villas for Rent | Browse Premium Properties - Malle Stays',
      description: 'Browse our exclusive collection of luxury villas. Filter by location, amenities, and budget. Find your perfect vacation home with private pools, chef service, and more.',
      keywords: 'luxury villa rental, premium villas, vacation properties, private villas, villas with pool, family villas, weekend getaway villas',
    },
    villaDetail: {
      title: `${data.villaName || 'Luxury Villa'} - Book Now | Malle Stays`,
      description: data.description || `Book ${data.villaName} - A luxury villa in ${data.location || 'India'}. Features ${data.bedrooms} bedrooms, ${data.bathrooms} bathrooms. Starting from ₹${data.price}/night.`,
      keywords: `${data.villaName}, luxury villa ${data.location}, ${data.bedrooms} bedroom villa, villa rental ${data.location}, vacation home ${data.location}`,
      ogTitle: `${data.villaName} - Luxury Villa in ${data.location || 'India'}`,
      ogDescription: `Experience luxury living at ${data.villaName}. ${data.bedrooms} bedrooms, ${data.bathrooms} bathrooms, starting from ₹${data.price}/night.`,
    },
    about: {
      title: 'About Malle Stays - Your Trusted Luxury Villa Rental Partner',
      description: 'Learn about Malle Stays, India\'s premier luxury villa rental platform. Our mission is to provide exceptional vacation experiences with world-class properties and service.',
      keywords: 'about malle stays, luxury villa company, vacation rental company india, premium property management',
    },
    contact: {
      title: 'Contact Us - Malle Stays | Book Your Luxury Villa Today',
      description: 'Get in touch with Malle Stays for bookings, inquiries, or custom villa requests. Available 24/7 via WhatsApp, email, or phone.',
      keywords: 'contact malle stays, villa booking inquiry, luxury villa contact, customer support',
    },
  };

  const currentMeta = metadata[page] || metadata.home;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: data.canonicalUrl || baseUrl,
    },
    openGraph: {
      title: currentMeta.ogTitle || currentMeta.title,
      description: currentMeta.ogDescription || currentMeta.description,
      url: data.canonicalUrl || baseUrl,
      siteName: siteName,
      images: [
        {
          url: data.image || defaultImage,
          width: 1200,
          height: 630,
          alt: currentMeta.ogTitle || currentMeta.title,
        },
      ],
      locale: 'en_IN',
      type: page === 'villaDetail' ? 'product' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentMeta.ogTitle || currentMeta.title,
      description: currentMeta.ogDescription || currentMeta.description,
      images: [data.image || defaultImage],
      creator: '@mallestays',
      site: '@mallestays',
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
      yandex: 'your-yandex-verification-code',
    },
  };
};

export const seoConfig = {
  siteName: 'Malle Stays',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://mallestays.com',
  defaultTitle: 'Malle Stays - Luxury Villa Rentals in India',
  defaultDescription: 'Discover luxury villa rentals in India. Premium vacation homes with world-class amenities.',
  defaultImage: '/og-image.jpg',
  twitterHandle: '@mallestays',
  facebookAppId: 'your-facebook-app-id',
  language: 'en-IN',
  country: 'IN',
  phoneNumber: '+918446620191',
  email: 'bookings@mallestays.com',
  address: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
  },
};
