import { MongoClient } from 'mongodb';

// Lazy singleton — do NOT throw at module import time, so that
// `next build` (which imports every route module to collect page data)
// does not fail on build servers that have not yet set MONGO_URL.
// Errors are deferred to actual connection time instead.

function buildOptions(uri) {
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
  return isLocal
    ? {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      }
    : {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,
        retryWrites: true,
        w: 'majority',
        compressors: ['zlib'],
      };
}

function logSafeConnectError(err, uri) {
  // Extract just the user and host from the URI so we never log the password
  let user = 'unknown';
  let host = 'unknown';
  try {
    const m = uri.match(/^mongodb(?:\+srv)?:\/\/(?:([^:]+):[^@]*@)?([^/?]+)/);
    if (m) {
      user = m[1] || '(none)';
      host = m[2];
    }
  } catch {}
  const msg = err?.message || String(err);
  console.error(
    `[mongodb] Connection failed. user=${user} host=${host} code=${err?.code} codeName=${err?.codeName} msg=${msg}`
  );
  if (/bad auth/i.test(msg)) {
    console.error(
      '[mongodb] HINT: Authentication failed. Verify (1) the username/password in MongoDB Atlas → Database Access match your MONGO_URL, (2) special characters in the password are URL-encoded (@ → %40, # → %23, / → %2F, etc.), and (3) the user has readWrite permission on the target database.'
    );
  }
}

function getClientPromise() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error('MONGO_URL is not set in environment');
  }
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, buildOptions(uri));
    global._mongoClientPromise = client.connect().catch((err) => {
      // Clear the cached promise so the next request retries instead of
      // being stuck with a rejected promise forever (common on cold-start creds fix).
      global._mongoClientPromise = undefined;
      logSafeConnectError(err, uri);
      throw err;
    });
  }
  return global._mongoClientPromise;
}

const clientPromise = {
  then: (...args) => getClientPromise().then(...args),
  catch: (...args) => getClientPromise().catch(...args),
  finally: (...args) => getClientPromise().finally(...args),
};
export default clientPromise;

export async function getDatabase() {
  const client = await getClientPromise();
  const dbName = process.env.DB_NAME || 'mallestays';
  return client.db(dbName);
}
