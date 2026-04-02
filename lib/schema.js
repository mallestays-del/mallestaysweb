// Schema markup generators for Malle Stays

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Malle Stays",
    "description": "Luxury Villa Rentals in India - Premium vacation villas with world-class amenities",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://mallestays.com",
    "logo": `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
    "image": `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.jpg`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/mallestays",
      "https://www.instagram.com/mallestays",
      "https://twitter.com/mallestays"
    ]
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Malle Stays",
    "description": "Luxury Villa Rentals and Vacation Homes",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://mallestays.com",
    "telephone": `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
    "priceRange": "₹₹₹",
    "image": `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.jpg`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "Maharashtra"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.0760",
      "longitude": "72.8777"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };
};

export const generateVillaSchema = (villa) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mallestays.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": villa.name,
    "description": villa.description,
    "image": villa.images || [],
    "sku": villa.id,
    "brand": {
      "@type": "Brand",
      "name": "Malle Stays"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/villa/${villa.slug}`,
      "priceCurrency": "INR",
      "price": villa.pricePerNight,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Malle Stays"
      }
    },
    "aggregateRating": villa.rating ? {
      "@type": "AggregateRating",
      "ratingValue": villa.rating,
      "reviewCount": villa.reviewCount || 1,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Bedrooms",
        "value": villa.bedrooms
      },
      {
        "@type": "PropertyValue",
        "name": "Bathrooms",
        "value": villa.bathrooms
      },
      {
        "@type": "PropertyValue",
        "name": "Max Guests",
        "value": villa.maxGuests || villa.guests
      },
      {
        "@type": "PropertyValue",
        "name": "Location",
        "value": villa.location
      }
    ]
  };
};

export const generateAccommodationSchema = (villa) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mallestays.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "name": villa.name,
    "description": villa.description,
    "url": `${baseUrl}/villa/${villa.slug}`,
    "image": villa.images || [],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": villa.location,
      "addressCountry": "IN"
    },
    "numberOfRooms": villa.bedrooms,
    "petsAllowed": villa.amenities?.includes("Pet Friendly") ? "Yes" : "No",
    "amenityFeature": (villa.amenities || []).map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })),
    "offers": {
      "@type": "Offer",
      "price": villa.pricePerNight,
      "priceCurrency": "INR"
    }
  };
};

export const generateReviewSchema = (reviews) => {
  return reviews.map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Malle Stays"
    },
    "author": {
      "@type": "Person",
      "name": review.guestName || review.name
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": review.reviewText || review.comment,
    "datePublished": review.createdAt || new Date().toISOString()
  }));
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateWebsiteSchema = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mallestays.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Malle Stays",
    "description": "Luxury Villa Rentals in India",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/villas?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};
