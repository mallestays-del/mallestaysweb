// Schema.org structured data generators for Malle Stays
// All generators return plain objects ready for JSON.stringify inside <script type="application/ld+json">

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://mallestays.com').replace(/\/$/, '');

export const BUSINESS = {
  name: 'Malle Stays™',
  legalName: 'Malle Stays',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  image: `${BASE_URL}/api/og`,
  telephone: '+91-8446620191',
  email: 'connect@mallestays.com',
  description: 'Luxury private-pool villa rentals in Lonavala, Alibaug, Karjat, Igatpuri and other weekend destinations near Mumbai & Pune.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '01 Panvelkar Estate, Badlapur East',
    addressLocality: 'Badlapur',
    addressRegion: 'Maharashtra',
    postalCode: '421503',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 19.1559, longitude: 73.2655 },
  sameAs: [
    'https://www.facebook.com/mallestays',
    'https://www.instagram.com/mallestays',
    'https://twitter.com/mallestays',
  ],
};

const clean = (obj) => JSON.parse(JSON.stringify(obj)); // strips undefined values

/** Only absolute http(s) image URLs are valid for structured data (drops base64 data URIs) */
export const webImages = (images = []) => (images || []).filter((i) => typeof i === 'string' && /^https?:\/\//i.test(i));

/** Compute aggregateRating from an array of reviews with `rating` fields */
export const buildAggregateRating = (reviews = []) => {
  const rated = reviews.filter((r) => Number(r?.rating) > 0);
  if (!rated.length) return undefined;
  const avg = rated.reduce((s, r) => s + Number(r.rating), 0) / rated.length;
  return {
    '@type': 'AggregateRating',
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: rated.length,
    bestRating: 5,
    worstRating: 1,
  };
};

export const generateOrganizationSchema = () =>
  clean({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: BUSINESS.url,
    logo: { '@type': 'ImageObject', url: BUSINESS.logo },
    image: BUSINESS.image,
    description: BUSINESS.description,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    address: BUSINESS.address,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.telephone,
      email: BUSINESS.email,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi', 'Marathi'],
    },
    sameAs: BUSINESS.sameAs,
  });

export const generateLocalBusinessSchema = (reviews = []) =>
  clean({
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${BASE_URL}/#lodgingbusiness`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: BUSINESS.url,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    image: BUSINESS.image,
    logo: BUSINESS.logo,
    priceRange: '₹₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
    address: BUSINESS.address,
    geo: BUSINESS.geo,
    areaServed: ['Lonavala', 'Alibaug', 'Karjat', 'Igatpuri', 'Neral', 'Khopoli', 'Badlapur', 'Maharashtra'].map((name) => ({
      '@type': 'Place',
      name,
    })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    aggregateRating: buildAggregateRating(reviews),
    sameAs: BUSINESS.sameAs,
  });

export const generateWebsiteSchema = () =>
  clean({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    name: BUSINESS.name,
    alternateName: 'Malle Stays',
    description: BUSINESS.description,
    url: BASE_URL,
    inLanguage: 'en-IN',
    publisher: { '@id': `${BASE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/villas?location={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  });

/**
 * Product + Offer schema for a villa (enables price rich snippets).
 * Pass approved villa reviews to include aggregateRating + review list.
 */
export const generateVillaSchema = (villa, reviews = []) =>
  clean({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/villa/${villa.slug}#product`,
    name: villa.name,
    description: villa.description,
    image: webImages(villa.images),
    sku: villa.id,
    url: `${BASE_URL}/villa/${villa.slug}`,
    category: villa.category || 'Vacation Rental',
    brand: { '@type': 'Brand', name: 'Malle Stays' },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/villa/${villa.slug}`,
      priceCurrency: 'INR',
      price: villa.pricePerNight,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: villa.pricePerNight,
        priceCurrency: 'INR',
        unitText: 'per night',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${BASE_URL}/#organization` },
    },
    aggregateRating: buildAggregateRating(reviews),
    review: reviews.slice(0, 10).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name || r.guestName || 'Guest' },
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : undefined,
      reviewBody: r.comment || r.reviewText,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    })),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Bedrooms', value: villa.bedrooms },
      { '@type': 'PropertyValue', name: 'Bathrooms', value: villa.bathrooms },
      { '@type': 'PropertyValue', name: 'Max Guests', value: villa.maxGuests || villa.guests },
      { '@type': 'PropertyValue', name: 'Location', value: villa.location },
    ],
  });

/** Google-recognised VacationRental type (replaces the generic Accommodation schema) */
export const generateVacationRentalSchema = (villa, reviews = []) =>
  clean({
    '@context': 'https://schema.org',
    '@type': 'VacationRental',
    '@id': `${BASE_URL}/villa/${villa.slug}#vacationrental`,
    additionalType: 'Villa',
    identifier: villa.id,
    name: villa.name,
    description: villa.description,
    url: `${BASE_URL}/villa/${villa.slug}`,
    image: webImages(villa.images),
    brand: { '@type': 'Brand', name: 'Malle Stays' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: villa.location,
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    latitude: villa.latitude,
    longitude: villa.longitude,
    containsPlace: {
      '@type': 'Accommodation',
      additionalType: 'EntirePlace',
      name: villa.name,
      numberOfBedrooms: villa.bedrooms,
      numberOfBathroomsTotal: villa.bathrooms,
      occupancy: { '@type': 'QuantitativeValue', maxValue: villa.maxGuests || villa.guests, unitCode: 'C62' },
      amenityFeature: (villa.amenities || []).map((amenity) => ({
        '@type': 'LocationFeatureSpecification',
        name: amenity,
        value: true,
      })),
      petsAllowed: (villa.amenities || []).some((a) => /pet/i.test(a)),
    },
    checkinTime: '14:00',
    checkoutTime: '11:00',
    aggregateRating: buildAggregateRating(reviews),
  });

// Kept for backwards compatibility - now delegates to VacationRental
export const generateAccommodationSchema = (villa, reviews = []) => generateVacationRentalSchema(villa, reviews);

export const generateReviewSchema = (reviews) =>
  reviews.map((review) =>
    clean({
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: { '@type': 'LodgingBusiness', name: BUSINESS.name, '@id': `${BASE_URL}/#lodgingbusiness` },
      author: { '@type': 'Person', name: review.guestName || review.name },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
      reviewBody: review.reviewText || review.comment,
      datePublished: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : undefined,
    })
  );

export const generateBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const generateFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question || faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer || faq.a },
  })),
});

/** ItemList of villas for the homepage / listings (helps Google understand the collection) */
export const generateVillaListSchema = (villas = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: villas.map((v, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${BASE_URL}/villa/${v.slug}`,
    name: v.name,
  })),
});
