import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/health
// Public endpoint that reports environment + Mongo connectivity WITHOUT leaking secrets.
// Useful for diagnosing Vercel deploy issues (e.g. 'bad auth').
export async function GET() {
  const uri = process.env.MONGO_URL || '';

  // Parse host/db/user from the connection string WITHOUT exposing the password
  let host = null;
  let user = null;
  let dbInUri = null;
  let scheme = null;
  let passwordHasSpecialChars = false;
  if (uri) {
    try {
      // mongodb+srv://user:pass@host/db?opts  or  mongodb://user:pass@host:27017/db?opts
      const m = uri.match(/^(mongodb(?:\+srv)?):\/\/(?:([^:]+):([^@]*)@)?([^/?]+)(?:\/([^?]+))?/);
      if (m) {
        scheme = m[1];
        user = m[2] || null;
        const rawPassword = m[3] || '';
        host = m[4];
        dbInUri = m[5] || null;
        // Flag passwords that likely need URL-encoding
        passwordHasSpecialChars = /[@#/?%&+= $!]/.test(rawPassword);
      }
    } catch {}
  }

  const result = {
    ok: false,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
      hasMongoUrl: !!uri,
      mongoScheme: scheme,
      mongoHost: host,
      mongoUser: user,
      mongoDbInUri: dbInUri,
      mongoDbEnv: process.env.DB_NAME || null,
      passwordLikelyNeedsUrlEncoding: passwordHasSpecialChars,
    },
    mongo: { connected: false },
  };

  if (!uri) {
    result.error = 'MONGO_URL is not set';
    return NextResponse.json(result, { status: 500 });
  }

  try {
    const db = await getDatabase();
    const stats = await db.command({ ping: 1 });
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    result.ok = true;
    result.mongo = {
      connected: true,
      ping: stats?.ok === 1,
      database: db.databaseName,
      collectionCount: collections.length,
      collections: collections.slice(0, 10).map((c) => c.name),
    };
    return NextResponse.json(result);
  } catch (err) {
    const msg = err?.message || String(err);
    const code = err?.code;
    const codeName = err?.codeName;
    result.mongo = {
      connected: false,
      error: msg,
      code,
      codeName,
    };
    // Add actionable hints for common failures
    const hints = [];
    if (/bad auth/i.test(msg) || codeName === 'AtlasError') {
      hints.push("Authentication failed. In MongoDB Atlas: Database Access → confirm the username and password. Then update MONGO_URL in Vercel.");
      if (passwordHasSpecialChars) {
        hints.push("Your password appears to contain special characters (@, #, /, %, &, +, =, $, space, !). These MUST be URL-encoded in the connection string. For example '@' → '%40', '#' → '%23', '/' → '%2F'.");
      }
    }
    if (/getaddrinfo|ENOTFOUND|ETIMEDOUT/i.test(msg)) {
      hints.push("Network/DNS error. In Atlas: Network Access → add 0.0.0.0/0 to allow Vercel pods, or add Vercel's egress IPs.");
    }
    if (/not authorized/i.test(msg)) {
      hints.push("User exists but lacks permissions. In Atlas: Database Access → edit user → grant 'readWrite' on your database.");
    }
    if (hints.length) result.hints = hints;
    return NextResponse.json(result, { status: 500 });
  }
}
