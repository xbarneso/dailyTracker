import { MongoClient, Db } from 'mongodb'

// Connection string
const defaultUri = process.env.MONGODB_URI || 'mongodb+srv://xbarnesortega:pokemon%2E123@cluster0.7eh5p62.mongodb.net/habittracker?retryWrites=true&w=majority&appName=Cluster0'

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(defaultUri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((err: any) => {
      console.error('MongoDB connection error:', err)
      console.error('Connection string:', defaultUri.replace(/:[^:@]+@/, ':****@')) // Hide password
      // Don't throw, return a rejected promise that can be handled
      return Promise.reject(err)
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(defaultUri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise
    // Test connection
    await client.db('admin').command({ ping: 1 })
    return client.db('habittracker')
  } catch (error: any) {
    console.error('Error getting database:', error)
    console.error('Error type:', error.name)
    console.error('Error message:', error.message)
    
    // Provide helpful error message
    if (error.name === 'MongoServerSelectionError') {
      throw new Error(`MongoDB connection failed: Unable to connect to MongoDB Atlas. Please check:
1. Your internet connection
2. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
3. Connection string is correct`)
    }
    
    throw new Error(`MongoDB connection failed: ${error.message}`)
  }
}
