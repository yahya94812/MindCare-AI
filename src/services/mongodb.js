// MongoDB Service - Client-side connection
import { demoMode, demoStorage } from './demo.js';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/mindcare-ai?retryWrites=true&w=majority';
const DB_NAME = 'mindcare-ai';

let client;
let db;

export const connectDB = async () => {
  // Use demo mode if MongoDB is not configured
  if (demoMode.isEnabled()) {
    return null; // Demo mode doesn't need real DB connection
  }

  if (!client) {
    const { MongoClient } = await import('mongodb');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
};

export const getUser = async (userId) => {
  if (demoMode.isEnabled()) {
    return demoStorage.getUser();
  }

  const database = await connectDB();
  const users = database.collection('users');
  return await users.findOne({ id: userId });
};

export const createUser = async (userData) => {
  if (demoMode.isEnabled()) {
    demoStorage.saveUser(userData);
    return { acknowledged: true };
  }

  const database = await connectDB();
  const users = database.collection('users');
  return await users.insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const saveJournalEntry = async (userId, journalData) => {
  if (demoMode.isEnabled()) {
    demoStorage.saveJournal({ userId, ...journalData });
    return { acknowledged: true };
  }

  const database = await connectDB();
  const journals = database.collection('journals');
  return await journals.insertOne({
    userId,
    ...journalData,
    createdAt: new Date()
  });
};

export const getUserJournals = async (userId, limit = 30) => {
  if (demoMode.isEnabled()) {
    const journals = demoStorage.getJournals();
    return journals
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  const database = await connectDB();
  const journals = database.collection('journals');
  return await journals
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

export const getMonthlyJournals = async (userId) => {
  if (demoMode.isEnabled()) {
    const journals = demoStorage.getJournals();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return journals
      .filter(j => j.userId === userId && new Date(j.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  const database = await connectDB();
  const journals = database.collection('journals');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return await journals
    .find({ 
      userId, 
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: 1 })
    .toArray();
};
