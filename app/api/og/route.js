import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

// Branded 1200x630 Open Graph image served at /api/og (absolute URL set in layout metadata)
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
          color: 'white',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: '#eab308', marginBottom: 24 }}>LUXURY VILLA RENTALS</div>
        <div style={{ fontSize: 96, fontWeight: 700, marginBottom: 16 }}>Malle Stays</div>
        <div style={{ fontSize: 34, color: '#cbd5e1', textAlign: 'center', maxWidth: 900 }}>
          Private pool villas in Lonavala, Alibaug, Karjat & beyond
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: 32, fontSize: 24, color: '#94a3b8' }}>
          <span>Verified Stays</span>
          <span>|</span>
          <span>Secure Booking</span>
          <span>|</span>
          <span>24/7 Support</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' },
    }
  );
}
