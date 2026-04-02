'use client';

import Head from 'next/head';

export default function SEOHead({ 
  title, 
  description, 
  keywords,
  canonicalUrl,
  image,
  type = 'website',
  author,
  publishedTime,
  modifiedTime 
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mallestays.com';
  const fullTitle = title ? `${title} | Malle Stays` : 'Malle Stays - Luxury Villa Rentals in India';
  const fullDescription = description || 'Discover luxury villa rentals in India. Premium vacation homes with world-class amenities.';
  const fullImage = image || `${baseUrl}/og-image.jpg`;
  const fullCanonicalUrl = canonicalUrl || baseUrl;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || 'Malle Stays'} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Malle Stays" />
      <meta property="og:locale" content="en_IN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:site" content="@mallestays" />
      <meta property="twitter:creator" content="@mallestays" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Language" content="en-IN" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Theme Color */}
      <meta name="theme-color" content="#92400e" />
      <meta name="msapplication-TileColor" content="#92400e" />
    </Head>
  );
}
