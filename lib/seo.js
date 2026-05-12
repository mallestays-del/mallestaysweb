// SEO Configuration
export const seoConfig = {
  siteName: 'Malle Stays',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://luxury-rental-test.preview.emergentagent.com',
  defaultTitle: 'Malle Stays - Luxury Villa Rentals & Premium Vacation Homes',
  defaultDescription: 'Discover curated luxury villas and estates for discerning travelers. Book your perfect retreat with Malle Stays - premium vacation rentals in India\'s most prestigious locations.',
  keywords: [
    'luxury villa rental',
    'premium vacation homes',
    'luxury stays India',
    'villa booking',
    'Lonavala villas',
    'Alibaug beach houses',
    'Karjat farmhouses',
    'weekend getaway',
    'luxury accommodation',
    'private pool villas'
  ]
};

// Generate structured data for rich snippets
export function generateStructuredData(type, data = {}) {
  const baseData = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'organization':
      return {
        ...baseData,
        '@type': 'Organization',
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        logo: `${seoConfig.siteUrl}/logo.png`,
        description: seoConfig.defaultDescription,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '01 Panvelkar Estate, Badlapur East',
          addressLocality: 'Mumbai',
          addressRegion: 'Maharashtra',
          postalCode: '421503',
          addressCountry: 'IN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-8446620191',
          contactType: 'Customer Service',
          email: 'connect@mallestays.com'
        }
      };

    case 'villa':
      return {
        ...baseData,
        '@type': 'LodgingBusiness',
        name: data.name,
        description: data.description,
        image: data.images || [],
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.location,
          addressCountry: 'IN'
        },
        geo: data.geo || {},
        priceRange: data.priceRange || '$$$$',
        amenityFeature: (data.amenities || []).map(amenity => ({
          '@type': 'LocationFeatureSpecification',
          name: amenity
        }))
      };

    default:
      return baseData;
  }
}

// Generate metadata for villa pages
export function generateVillaMetadata(villa) {
  return {
    title: `${villa.name} - ${villa.location} | ${seoConfig.siteName}`,
    description: villa.description?.substring(0, 160) || seoConfig.defaultDescription,
    keywords: `${villa.name}, ${villa.location}, luxury villa, ${villa.category || 'premium accommodation'}, vacation rental`,
    openGraph: {
      title: villa.name,
      description: villa.description?.substring(0, 160),
      images: villa.images || [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: villa.name,
      description: villa.description?.substring(0, 160),
      images: villa.images?.[0] || '',
    }
  };
}
