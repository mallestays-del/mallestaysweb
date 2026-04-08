import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  tls: true,
  retryWrites: true,
  w: 'majority',
};

// For local development (localhost doesn't need TLS)
const localOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

let client;
let clientPromise;

if (!process.env.MONGO_URL) {
  throw new Error('Please add your Mongo URI to .env');
}

const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
const connectionOptions = isLocal ? localOptions : options;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, connectionOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, connectionOptions);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  const client = await clientPromise;
  const dbName = process.env.DB_NAME || 'mallestays';
  return client.db(dbName);
}
