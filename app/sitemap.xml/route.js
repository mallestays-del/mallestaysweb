import { getDatabase } from '@/lib/mongodb';
import { seoConfig } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
};

const urlEntry = ({ loc, lastmod, changefreq, priority, images = [] }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${images
      .filter(Boolean)
      .slice(0, 5)
      .map(
        (img) => `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>${img.title ? `
      <image:title>${escapeXml(img.title)}</image:title>` : ''}${img.caption ? `
      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>`
      )
      .join('')}
  </url>`;

export async function GET() {
  const baseUrl = seoConfig.siteUrl.replace(/\/$/, '');

  let villas = [];
  let latestVillaUpdate = null;

  try {
    const db = await getDatabase();
    villas = await db
      .collection('villas')
      .find({}, { projection: { slug: 1, name: 1, description: 1, images: 1, updatedAt: 1, createdAt: 1, location: 1 } })
      .sort({ createdAt: -1 })
      .toArray();
    latestVillaUpdate = villas.reduce((acc, v) => {
      const d = toDate(v.updatedAt || v.createdAt);
      return !acc || (d && d > acc) ? d : acc;
    }, null);
  } catch (error) {
    console.error('Sitemap DB error:', error.message);
  }

  const staticPages = [
    { path: '', changefreq: 'daily', priority: '1.0', lastmod: latestVillaUpdate },
    { path: '/villas', changefreq: 'daily', priority: '0.9', lastmod: latestVillaUpdate },
    { path: '/gallery', changefreq: 'weekly', priority: '0.7' },
    { path: '/about', changefreq: 'monthly', priority: '0.6' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/partner', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  ];

  const entries = [
    ...staticPages.map((p) => urlEntry({ loc: `${baseUrl}${p.path}`, ...p })),
    ...villas
      .filter((v) => v.slug)
      .map((villa) =>
        urlEntry({
          loc: `${baseUrl}/villa/${villa.slug}`,
          lastmod: toDate(villa.updatedAt || villa.createdAt),
          changefreq: 'weekly',
          priority: '0.8',
          images: (villa.images || []).filter((img) => /^https?:\/\//i.test(img)).map((img, i) => ({
            loc: img,
            title: i === 0 ? `${villa.name} - Luxury Villa in ${villa.location}` : `${villa.name} - Photo ${i + 1}`,
            caption: i === 0 ? villa.description?.substring(0, 160) : undefined,
          })),
        })
      ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
