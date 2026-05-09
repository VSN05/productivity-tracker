import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('tracker');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = await getDb();
  const collection = db.collection('shares');

  // Save your day's data with a short code
  if (req.method === 'POST') {
    const { sessions, total } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await collection.insertOne({
      code,
      sessions,
      total,
      date: new Date().toDateString(),
      createdAt: new Date(),
    });
    return res.status(200).json({ code });
  }

  // Load a friend's data by code
  if (req.method === 'GET') {
    const { code } = req.query;
    const data = await collection.findOne({ code: code.toUpperCase() });
    if (!data) return res.status(404).json({ error: 'Code not found' });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
