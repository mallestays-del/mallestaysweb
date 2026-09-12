import { notFound } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { seoConfig } from '@/lib/seo';
import {
  generateVillaSchema,
  generateVacationRentalSchema,
  generateBreadcrumbSchema,
  webImages,
} from '@/lib/schema';
import VillaDetailsClient from './VillaDetailsClient';

export const dynamic = 'force-dynamic';

async function getVillaWithReviews(slug) {
  try {
    const db = await getDatabase();
    const villa = await db.collection('villas').findOne({ slug }, { projection: { _id: 0 } });
    if (!villa) return { villa: null, reviews: [] };
    const reviews = await db
      .collection('reviews')
      .find({ villaId: villa.id, approved: true }, { projection: { _id: 0, name: 1, rating: 1, comment: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    return { villa, reviews };
  } catch (err) {
    console.error('Villa page DB error:', err.message);
    return { villa: null, reviews: [] };
  }
}

const truncate = (str = '', n = 155) => (str.length > n ? `${str.substring(0, n - 1).trim()}…` : str);

export async function generateMetadata({ params }) {
  const { villa } = await getVillaWithReviews(params.slug);
  if (!villa) {
    return { title: 'Villa Not Found', robots: { index: false, follow: false } };
  }

  const url = `${seoConfig.siteUrl}/villa/${villa.slug}`;
  const priceText = villa.pricePerNight ? ` from ₹${Number(villa.pricePerNight).toLocaleString('en-IN')}/night` : '';
  const customTitle = villa.seoTitle && villa.seoTitle.trim() !== (villa.name || '').trim() ? villa.seoTitle : null;
  const defaultDesc = (villa.description || '').substring(0, 160);
  const customDesc = villa.seoDescription && villa.seoDescription.trim() !== defaultDesc.trim() ? villa.seoDescription : null;
  const title = customTitle || `${villa.name} - Luxury ${villa.category || 'Villa'} in ${villa.location}${priceText}`;
  const description = truncate(
    customDesc ||
      `${villa.name} in ${villa.location}: ${villa.bedrooms || ''} bedroom private villa for up to ${villa.maxGuests || ''} guests${priceText}. ${villa.description || ''}`
  );
  const images = webImages(villa.images).slice(0, 4).map((src) => ({ url: src, alt: `${villa.name} - ${villa.location}` }));

  return {
    title,
    description,
    keywords: villa.seoKeywords || `${villa.name}, villa in ${villa.location}, ${villa.location} villa rental, private pool villa ${villa.location}, weekend getaway near Mumbai`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: seoConfig.siteName,
      locale: 'en_IN',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((i) => i.url),
    },
    robots: { index: true, follow: true },
  };
}

export default async function VillaPage({ params }) {
  const { villa, reviews } = await getVillaWithReviews(params.slug);

  if (!villa) {
    notFound();
  }

  const schemas = [
    generateVillaSchema(villa, reviews),
    generateVacationRentalSchema(villa, reviews),
    generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Villas', url: `${seoConfig.siteUrl}/villas` },
      { name: villa.location, url: `${seoConfig.siteUrl}/villas?location=${encodeURIComponent(villa.location)}` },
      { name: villa.name, url: `${seoConfig.siteUrl}/villa/${villa.slug}` },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <VillaDetailsClient initialVilla={villa} />
    </>
  );
}
