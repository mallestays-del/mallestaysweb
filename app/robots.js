import { seoConfig } from '@/lib/seo';

// Next.js metadata-file convention -> served at /robots.txt
export default function robots() {
  const baseUrl = seoConfig.siteUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/og'],
        disallow: [
          '/api/',
          '/admin/',
          '/admin',
          '/checkout',
          '/booking/',
          '/test-reviews',
          '/*?*checkIn=',
          '/*?*checkOut=',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
