// SEO Keywords and Metadata Configuration
export const seoConfig = {
  siteName: 'Malle Stays',
  siteUrl: 'https://villa-retreat-app.preview.emergentagent.com',
  defaultTitle: 'Malle Stays - Luxury Villa Rentals & Premium Vacation Homes in Maharashtra',
  defaultDescription: 'Book luxury villas, premium vacation homes & farmhouses in Lonavala, Alibaug, Karjat. Private pools, mountain views, beach access. Perfect for family getaways & group stays.',
  keywords: [
    // Primary Keywords
    'luxury villa rentals Maharashtra',
    'premium vacation homes India',
    'luxury villas in Lonavala',
    'beach villas Alibaug',
    'mountain villas Karjat',
    'farmhouse rentals near Mumbai',
    
    // Location-based Keywords
    'villas in Lonavala with private pool',
    'luxury villas Alibaug beachfront',
    'holiday homes Karjat',
    'weekend getaway villas Igatpuri',
    'luxury farmhouses Badlapur',
    'vacation rentals Neral',
    'resort villas Khopoli',
    
    // Feature-based Keywords
    'private pool villas',
    'villas with mountain view',
    'beachfront luxury villas',
    'family vacation homes',
    'group stay villas',
    'weekend retreat villas',
    'luxury staycation properties',
    
    // Service Keywords
    'villa booking Maharashtra',
    'luxury property rental',
    'premium villa stays',
    'curated vacation homes',
    'exclusive villa rentals',
    
    // Long-tail Keywords
    'luxury villas for family vacation',
    'private villas with chef service',
    'villas near Mumbai for weekend',
    'luxury homestays Maharashtra',
    'premium villas with amenities'
  ]
};

export const locationKeywords = {
  'Lonavala': [
    'luxury villas in Lonavala',
    'Lonavala villa with private pool',
    'weekend getaway Lonavala',
    'luxury homestay Lonavala',
    'hill station villas Maharashtra',
    'Lonavala vacation rentals',
    'premium villas Lonavala hills'
  ],
  'Alibaug': [
    'beach villas Alibaug',
    'luxury beachfront properties Alibaug',
    'Alibaug weekend homes',
    'sea view villas Alibaug',
    'beach house rentals Alibaug',
    'luxury coastal villas Maharashtra',
    'Alibaug private beach villas'
  ],
  'Karjat': [
    'luxury villas Karjat',
    'Karjat farmhouse rentals',
    'nature retreat villas Karjat',
    'weekend villas near Karjat',
    'luxury homestays Karjat',
    'riverside villas Karjat',
    'Karjat luxury properties'
  ],
  'Igatpuri': [
    'mountain villas Igatpuri',
    'luxury retreats Igatpuri',
    'hilltop villas Igatpuri',
    'Igatpuri weekend villas',
    'luxury properties Igatpuri',
    'scenic villas Igatpuri'
  ]
};

export const categoryKeywords = {
  'Poolside Villa': [
    'villas with private pool',
    'luxury pool villas Maharashtra',
    'infinity pool villas India',
    'private pool vacation homes',
    'pool villas for family'
  ],
  'Beach Villa': [
    'beachfront villas',
    'luxury beach houses',
    'coastal villas India',
    'sea view luxury homes',
    'beach vacation rentals'
  ],
  'Mountain Villa': [
    'mountain view villas',
    'hill station luxury homes',
    'scenic mountain villas',
    'hilltop vacation rentals',
    'mountain retreat properties'
  ],
  'Farmhouse Villa': [
    'luxury farmhouse rentals',
    'farmhouse villas Maharashtra',
    'countryside luxury homes',
    'farm stay properties',
    'rural luxury villas'
  ]
};

export function generatePageMetadata(page, data = {}) {
  const metadata = {
    home: {
      title: 'Malle Stays - Luxury Villa Rentals in Lonavala, Alibaug, Karjat | Premium Vacation Homes',
      description: 'Discover handpicked luxury villas with private pools, stunning views, and premium amenities. Perfect for family vacations, weekend getaways, and special celebrations in Maharashtra.',
      keywords: seoConfig.keywords.slice(0, 15).join(', ')
    },
    villas: {
      title: 'Luxury Villas & Premium Vacation Homes | Browse Our Collection - Malle Stays',
      description: 'Explore our curated collection of luxury villas in Maharashtra. Private pools, mountain views, beach access, and modern amenities. Book your perfect vacation home today.',
      keywords: 'luxury villa rentals, premium vacation homes, villas in Maharashtra, weekend getaway villas, family vacation properties'
    },
    villaDetail: {
      title: `${data.name} - Luxury ${data.category} in ${data.location} | Malle Stays`,
      description: `Book ${data.name} in ${data.location}. ${data.bedrooms} bedrooms, accommodates ${data.maxGuests} guests. ${data.description?.substring(0, 100)}... Starting from ₹${data.pricePerNight}/night.`,
      keywords: `${data.name}, luxury villa ${data.location}, ${data.category}, vacation rental ${data.location}, ${data.bedrooms} bedroom villa, ${data.amenities?.join(', ')}`
    },
    location: {
      title: `Luxury Villas in ${data.location} | Premium Vacation Homes - Malle Stays`,
      description: `Find the best luxury villas in ${data.location}. Private pools, stunning views, modern amenities. Perfect for weekend getaways and family vacations. Book now!`,
      keywords: `luxury villas ${data.location}, vacation rentals ${data.location}, weekend homes ${data.location}, ${locationKeywords[data.location]?.join(', ')}`
    },
    category: {
      title: `${data.category}s in Maharashtra | Luxury Vacation Properties - Malle Stays`,
      description: `Browse our premium collection of ${data.category}s. Handpicked properties with exceptional amenities and stunning locations across Maharashtra.`,
      keywords: `${data.category}, luxury ${data.category}s Maharashtra, ${categoryKeywords[data.category]?.join(', ')}`
    },
    contact: {
      title: 'Contact Us - Malle Stays | Luxury Villa Booking Assistance',
      description: 'Get in touch with Malle Stays for luxury villa bookings, property inquiries, and personalized vacation planning. Call +91 8446620191 or email connect@mallestays.com',
      keywords: 'contact Malle Stays, villa booking assistance, luxury property inquiries, vacation planning Maharashtra'
    },
    partner: {
      title: 'List Your Luxury Villa | Become a Partner - Malle Stays',
      description: 'Partner with Malle Stays to list your luxury villa, farmhouse, or vacation property. Reach thousands of travelers and maximize your property revenue.',
      keywords: 'list luxury villa, villa rental partnership, property listing Maharashtra, vacation rental partnership'
    }
  };

  return metadata[page] || metadata.home;
}

export function generateStructuredData(type, data = {}) {
  const baseData = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'organization':
      return {
        ...baseData,
        '@type': 'Organization',
        name: 'Malle Stays',
        url: seoConfig.siteUrl,
        logo: `${seoConfig.siteUrl}/logo.png`,
        description: seoConfig.defaultDescription,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '01 Panvelkar Estate',
          addressLocality: 'Badlapur East',
          addressRegion: 'Maharashtra',
          postalCode: '421503',
          addressCountry: 'IN'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-8446620191',
          contactType: 'customer service',
          email: 'connect@mallestays.com',
          availableLanguage: ['English', 'Hindi', 'Marathi']
        },
        sameAs: [
          'https://www.facebook.com/profile.php?id=61580271326579',
          'https://www.instagram.com/mallestays',
          'https://x.com/MalleStays',
          'https://www.linkedin.com/in/mallestays'
        ]
      };

    case 'villa':
      return {
        ...baseData,
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.images || [],
        offers: {
          '@type': 'Offer',
          price: data.pricePerNight,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          reviewCount: data.reviewCount || 0
        } : undefined
      };

    case 'breadcrumb':
      return {
        ...baseData,
        '@type': 'BreadcrumbList',
        itemListElement: data.items?.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${seoConfig.siteUrl}${item.url}`
        }))
      };

    default:
      return baseData;
  }
}
