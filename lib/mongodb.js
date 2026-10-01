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

function getClientPromise() {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error('MONGO_URL is not set in environment');
  }
  // Reuse promise across hot-reloads in dev and across invocations in prod
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, buildOptions(uri));
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

// Default export keeps backward compatibility with any `import clientPromise from '@/lib/mongodb'`
// but now resolves lazily on first access.
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
