import { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '../../lib/db/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await getDb()
    const collections = await db.listCollections().toArray()
    
    return res.json({ 
      success: true,
      message: 'Conexión a MongoDB exitosa',
      database: db.databaseName,
      collections: collections.map(c => c.name)
    })
  } catch (error: any) {
    console.error('MongoDB connection error:', error)
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Error conectando a MongoDB',
      details: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

