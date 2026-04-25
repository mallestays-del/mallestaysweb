import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;

if (!process.env.MONGO_URL) {
  throw new Error('Please add your Mongo URI to .env');
}

const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

const options = isLocal ? {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
} : {
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

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel), cache the connection in module scope
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  const dbName = process.env.DB_NAME || 'mallestays';
  return client.db(dbName);
}
