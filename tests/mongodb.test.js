// MongoDB Connection Tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoClient } from 'mongodb';
import { 
  connectDB, 
  getUser, 
  createUser, 
  saveJournalEntry, 
  getUserJournals, 
  getMonthlyJournals 
} from '../src/services/mongodb.js';

// Test configuration
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017';
const TEST_DB_NAME = 'mindcare-ai-test';

describe('MongoDB Connection Tests', () => {
  let testClient;
  let testDb;

  beforeAll(async () => {
    // Setup test database connection
    testClient = new MongoClient(TEST_MONGODB_URI);
    await testClient.connect();
    testDb = testClient.db(TEST_DB_NAME);
  });

  afterAll(async () => {
    // Cleanup test database
    if (testDb) {
      await testDb.dropDatabase();
    }
    if (testClient) {
      await testClient.close();
    }
  });

  beforeEach(async () => {
    // Clean up collections before each test
    const collections = await testDb.listCollections().toArray();
    for (const collection of collections) {
      await testDb.collection(collection.name).deleteMany({});
    }
  });

  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      const db = await connectDB();
      expect(db).toBeDefined();
    });

    it('should return null in demo mode', async () => {
      // Mock demo mode
      const originalEnv = process.env.VITE_MONGODB_URI;
      process.env.VITE_MONGODB_URI = 'mongodb+srv://demo:demo@cluster.mongodb.net/mindcare-ai';
      
      const db = await connectDB();
      expect(db).toBeNull();
      
      // Restore original environment
      process.env.VITE_MONGODB_URI = originalEnv;
    });
  });

  describe('User Operations', () => {
    const testUser = {
      id: 'test_user_123',
      name: 'Test User',
      password: 'test123',
      createdAt: new Date().toISOString(),
      picture: 'https://example.com/avatar.jpg'
    };

    it('should create a new user', async () => {
      const result = await createUser(testUser);
      expect(result.acknowledged).toBe(true);
      expect(result.insertedId).toBeDefined();
    });

    it('should retrieve an existing user', async () => {
      // First create a user
      await testDb.collection('users').insertOne(testUser);
      
      const retrievedUser = await getUser(testUser.id);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.id).toBe(testUser.id);
      expect(retrievedUser.name).toBe(testUser.name);
    });

    it('should return null for non-existent user', async () => {
      const retrievedUser = await getUser('non_existent_user');
      expect(retrievedUser).toBeNull();
    });

    it('should add timestamps when creating user', async () => {
      const userWithoutTimestamps = {
        id: 'timestamp_test_user',
        name: 'Timestamp Test User',
        password: 'test123'
      };

      await createUser(userWithoutTimestamps);
      const retrievedUser = await getUser('timestamp_test_user');
      
      expect(retrievedUser.createdAt).toBeDefined();
      expect(retrievedUser.updatedAt).toBeDefined();
      expect(new Date(retrievedUser.createdAt)).toBeInstanceOf(Date);
      expect(new Date(retrievedUser.updatedAt)).toBeInstanceOf(Date);
    });
  });

  describe('Journal Operations', () => {
    const testUserId = 'journal_test_user';
    const testJournalEntry = {
      morning: 'Good morning feeling',
      afternoon: 'Afternoon thoughts',
      evening: 'Evening reflection',
      morningMood: 'Happy',
      morningScore: 8,
      afternoonMood: 'Content',
      afternoonScore: 7,
      eveningMood: 'Peaceful',
      eveningScore: 9,
      overallMood: 'Happy',
      overallScore: 8,
      date: new Date().toISOString().split('T')[0]
    };

    beforeEach(async () => {
      // Create test user for journal operations
      await testDb.collection('users').insertOne({
        id: testUserId,
        name: 'Journal Test User',
        createdAt: new Date()
      });
    });

    it('should save a journal entry', async () => {
      const result = await saveJournalEntry(testUserId, testJournalEntry);
      expect(result.acknowledged).toBe(true);
      expect(result.insertedId).toBeDefined();
    });

    it('should add timestamp when saving journal entry', async () => {
      await saveJournalEntry(testUserId, testJournalEntry);
      
      const journals = await testDb.collection('journals').find({ userId: testUserId }).toArray();
      expect(journals).toHaveLength(1);
      expect(journals[0].createdAt).toBeDefined();
      expect(new Date(journals[0].createdAt)).toBeInstanceOf(Date);
    });

    it('should retrieve user journals with limit', async () => {
      // Create multiple journal entries
      const entries = Array.from({ length: 5 }, (_, i) => ({
        ...testJournalEntry,
        morning: `Morning entry ${i + 1}`,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Different days
      }));

      for (const entry of entries) {
        await saveJournalEntry(testUserId, entry);
      }

      const journals = await getUserJournals(testUserId, 3);
      expect(journals).toHaveLength(3);
      
      // Should be sorted by createdAt descending (newest first)
      expect(new Date(journals[0].createdAt).getTime())
        .toBeGreaterThan(new Date(journals[1].createdAt).getTime());
    });

    it('should retrieve monthly journals', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

      // Create entries within and outside the 30-day range
      const recentEntry = { ...testJournalEntry, morning: 'Recent entry' };
      const oldEntry = { ...testJournalEntry, morning: 'Old entry' };

      await saveJournalEntry(testUserId, recentEntry);
      
      // Insert old entry directly to control timestamp
      await testDb.collection('journals').insertOne({
        userId: testUserId,
        ...oldEntry,
        createdAt: fortyDaysAgo
      });

      const monthlyJournals = await getMonthlyJournals(testUserId);
      expect(monthlyJournals).toHaveLength(1);
      expect(monthlyJournals[0].morning).toBe('Recent entry');
    });

    it('should return empty array for user with no journals', async () => {
      const journals = await getUserJournals('user_with_no_journals');
      expect(journals).toEqual([]);
    });

    it('should handle journal queries with different sort orders', async () => {
      const entries = [
        { ...testJournalEntry, morning: 'Entry 1', createdAt: new Date('2024-01-01') },
        { ...testJournalEntry, morning: 'Entry 2', createdAt: new Date('2024-01-02') },
        { ...testJournalEntry, morning: 'Entry 3', createdAt: new Date('2024-01-03') }
      ];

      for (const entry of entries) {
        await testDb.collection('journals').insertOne({
          userId: testUserId,
          ...entry
        });
      }

      // getUserJournals should return newest first
      const userJournals = await getUserJournals(testUserId);
      expect(userJournals[0].morning).toBe('Entry 3');
      expect(userJournals[2].morning).toBe('Entry 1');

      // getMonthlyJournals should return oldest first
      const monthlyJournals = await getMonthlyJournals(testUserId);
      expect(monthlyJournals[0].morning).toBe('Entry 1');
      expect(monthlyJournals[2].morning).toBe('Entry 3');
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Mock a connection error
      const originalUri = process.env.VITE_MONGODB_URI;
      process.env.VITE_MONGODB_URI = 'mongodb://invalid:27017';

      await expect(connectDB()).rejects.toThrow();
      
      // Restore original URI
      process.env.VITE_MONGODB_URI = originalUri;
    });

    it('should handle database operation errors', async () => {
      // Test with invalid data
      await expect(createUser(null)).rejects.toThrow();
      await expect(saveJournalEntry(null, null)).rejects.toThrow();
    });
  });

  describe('Demo Mode Integration', () => {
    it('should use demo storage when in demo mode', async () => {
      // Mock demo mode environment
      const originalGeminiKey = process.env.VITE_GEMINI_API_KEY;
      const originalMongoUri = process.env.VITE_MONGODB_URI;
      
      process.env.VITE_GEMINI_API_KEY = 'demo_gemini_api_key';
      process.env.VITE_MONGODB_URI = 'mongodb+srv://demo:demo@cluster.mongodb.net/mindcare-ai';

      // Clear demo storage
      localStorage.removeItem('mindcare_demo_user');
      localStorage.removeItem('mindcare_demo_journals');

      const testUser = { id: 'demo_user', name: 'Demo User' };
      
      // These should use demo storage instead of real DB
      const createResult = await createUser(testUser);
      expect(createResult.acknowledged).toBe(true);

      const retrievedUser = await getUser('demo_user');
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.name).toBe('Demo User');

      // Restore original environment
      process.env.VITE_GEMINI_API_KEY = originalGeminiKey;
      process.env.VITE_MONGODB_URI = originalMongoUri;
    });
  });
});
