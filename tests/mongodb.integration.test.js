// MongoDB Integration Tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  connectDB, 
  getUser, 
  createUser, 
  saveJournalEntry, 
  getUserJournals, 
  getMonthlyJournals 
} from '../src/services/mongodb.js';

describe('MongoDB Integration Tests', () => {
  // Test data
  const testUser = {
    id: 'integration_test_user_' + Date.now(),
    name: 'Integration Test User',
    password: 'test123',
    picture: 'https://ui-avatars.com/api/?name=Test%20User&background=2563eb&color=fff&size=40'
  };

  const sampleJournalEntry = {
    morning: 'Started my day with meditation and felt peaceful.',
    afternoon: 'Had a productive work session, feeling accomplished.',
    evening: 'Enjoyed dinner with family, feeling grateful.',
    morningMood: 'Content',
    morningScore: 7,
    morningTip: 'Keep up the mindfulness practice.',
    afternoonMood: 'Happy',
    afternoonScore: 8,
    afternoonTip: 'Great job on staying focused!',
    eveningMood: 'Grateful',
    eveningScore: 9,
    eveningTip: 'Family time is precious, cherish these moments.',
    overallMood: 'Happy',
    overallScore: 8,
    dailySummary: 'A well-balanced day with positive emotions throughout.',
    date: new Date().toISOString().split('T')[0]
  };

  beforeAll(async () => {
    // Ensure we're not in demo mode for integration tests
    const db = await connectDB();
    if (!db) {
      throw new Error('Cannot run integration tests in demo mode. Please configure real MongoDB URI.');
    }
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      const db = await connectDB();
      if (db) {
        await db.collection('users').deleteMany({ id: { $regex: /^integration_test_user_/ } });
        await db.collection('journals').deleteMany({ userId: { $regex: /^integration_test_user_/ } });
      }
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  });

  describe('Full User Journey', () => {
    it('should complete a full user registration and journaling workflow', async () => {
      // Step 1: Create a new user
      const createResult = await createUser(testUser);
      expect(createResult.acknowledged).toBe(true);

      // Step 2: Verify user was created
      const retrievedUser = await getUser(testUser.id);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.name).toBe(testUser.name);
      expect(retrievedUser.createdAt).toBeDefined();
      expect(retrievedUser.updatedAt).toBeDefined();

      // Step 3: Save a journal entry
      const journalResult = await saveJournalEntry(testUser.id, sampleJournalEntry);
      expect(journalResult.acknowledged).toBe(true);

      // Step 4: Retrieve user journals
      const journals = await getUserJournals(testUser.id);
      expect(journals).toHaveLength(1);
      expect(journals[0].morning).toBe(sampleJournalEntry.morning);
      expect(journals[0].overallScore).toBe(sampleJournalEntry.overallScore);

      // Step 5: Check monthly journals
      const monthlyJournals = await getMonthlyJournals(testUser.id);
      expect(monthlyJournals).toHaveLength(1);
      expect(monthlyJournals[0].userId).toBe(testUser.id);
    });

    it('should handle multiple journal entries over time', async () => {
      // Create multiple journal entries with different dates
      const entries = [
        {
          ...sampleJournalEntry,
          morning: 'Day 1 morning',
          overallScore: 6,
          date: '2024-01-01'
        },
        {
          ...sampleJournalEntry,
          morning: 'Day 2 morning',
          overallScore: 7,
          date: '2024-01-02'
        },
        {
          ...sampleJournalEntry,
          morning: 'Day 3 morning',
          overallScore: 8,
          date: '2024-01-03'
        }
      ];

      // Save all entries
      for (const entry of entries) {
        const result = await saveJournalEntry(testUser.id, entry);
        expect(result.acknowledged).toBe(true);
      }

      // Retrieve all journals
      const allJournals = await getUserJournals(testUser.id, 10);
      expect(allJournals.length).toBeGreaterThanOrEqual(3);

      // Verify sorting (newest first for getUserJournals)
      const morningTexts = allJournals.map(j => j.morning);
      expect(morningTexts).toContain('Day 1 morning');
      expect(morningTexts).toContain('Day 2 morning');
      expect(morningTexts).toContain('Day 3 morning');
    });
  });

  describe('Data Persistence and Retrieval', () => {
    it('should persist user data correctly', async () => {
      const uniqueUser = {
        id: 'persistence_test_' + Date.now(),
        name: 'Persistence Test User',
        password: 'secure123',
        picture: 'https://example.com/avatar.jpg'
      };

      // Create user
      await createUser(uniqueUser);

      // Retrieve and verify all fields
      const savedUser = await getUser(uniqueUser.id);
      expect(savedUser.id).toBe(uniqueUser.id);
      expect(savedUser.name).toBe(uniqueUser.name);
      expect(savedUser.password).toBe(uniqueUser.password);
      expect(savedUser.picture).toBe(uniqueUser.picture);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should persist journal data with all fields', async () => {
      const detailedEntry = {
        morning: 'Detailed morning entry with special characters: 🌅 ñ ü',
        afternoon: 'Afternoon entry with numbers: 123 and symbols: @#$',
        evening: 'Evening entry with quotes: "Hello World" and apostrophes: don\'t',
        morningMood: 'Excited',
        morningScore: 9,
        morningTip: 'Keep channeling that positive energy!',
        afternoonMood: 'Focused',
        afternoonScore: 8,
        afternoonTip: 'Great concentration today.',
        eveningMood: 'Reflective',
        eveningScore: 7,
        eveningTip: 'Take time to process your thoughts.',
        overallMood: 'Positive',
        overallScore: 8,
        dailySummary: 'A day of varied emotions and growth.',
        date: new Date().toISOString().split('T')[0]
      };

      await saveJournalEntry(testUser.id, detailedEntry);

      const journals = await getUserJournals(testUser.id, 1);
      const savedEntry = journals[0];

      // Verify all fields are preserved
      expect(savedEntry.morning).toBe(detailedEntry.morning);
      expect(savedEntry.afternoon).toBe(detailedEntry.afternoon);
      expect(savedEntry.evening).toBe(detailedEntry.evening);
      expect(savedEntry.morningMood).toBe(detailedEntry.morningMood);
      expect(savedEntry.morningScore).toBe(detailedEntry.morningScore);
      expect(savedEntry.overallScore).toBe(detailedEntry.overallScore);
      expect(savedEntry.dailySummary).toBe(detailedEntry.dailySummary);
    });
  });

  describe('Performance and Limits', () => {
    it('should handle journal retrieval with different limits', async () => {
      // Create 10 journal entries
      const entries = Array.from({ length: 10 }, (_, i) => ({
        ...sampleJournalEntry,
        morning: `Performance test entry ${i + 1}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      for (const entry of entries) {
        await saveJournalEntry(testUser.id, entry);
      }

      // Test different limits
      const journals5 = await getUserJournals(testUser.id, 5);
      expect(journals5).toHaveLength(5);

      const journals3 = await getUserJournals(testUser.id, 3);
      expect(journals3).toHaveLength(3);

      const journalsDefault = await getUserJournals(testUser.id);
      expect(journalsDefault.length).toBeGreaterThanOrEqual(10);
    });

    it('should efficiently filter monthly journals', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
      const recentDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

      // Save one old entry and one recent entry
      await saveJournalEntry(testUser.id, {
        ...sampleJournalEntry,
        morning: 'Old entry - should not appear',
        date: oldDate.toISOString().split('T')[0]
      });

      await saveJournalEntry(testUser.id, {
        ...sampleJournalEntry,
        morning: 'Recent entry - should appear',
        date: recentDate.toISOString().split('T')[0]
      });

      const monthlyJournals = await getMonthlyJournals(testUser.id);
      const morningTexts = monthlyJournals.map(j => j.morning);
      
      expect(morningTexts).toContain('Recent entry - should appear');
      expect(morningTexts).not.toContain('Old entry - should not appear');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty journal entries', async () => {
      const emptyEntry = {
        morning: '',
        afternoon: '',
        evening: '',
        morningMood: 'Neutral',
        morningScore: 5,
        afternoonMood: 'Neutral',
        afternoonScore: 5,
        eveningMood: 'Neutral',
        eveningScore: 5,
        overallMood: 'Neutral',
        overallScore: 5,
        date: new Date().toISOString().split('T')[0]
      };

      const result = await saveJournalEntry(testUser.id, emptyEntry);
      expect(result.acknowledged).toBe(true);

      const journals = await getUserJournals(testUser.id, 1);
      expect(journals[0].morning).toBe('');
      expect(journals[0].afternoon).toBe('');
      expect(journals[0].evening).toBe('');
    });

    it('should handle very long journal entries', async () => {
      const longText = 'A'.repeat(10000); // 10,000 characters
      const longEntry = {
        ...sampleJournalEntry,
        morning: longText,
        afternoon: longText,
        evening: longText
      };

      const result = await saveJournalEntry(testUser.id, longEntry);
      expect(result.acknowledged).toBe(true);

      const journals = await getUserJournals(testUser.id, 1);
      expect(journals[0].morning).toBe(longText);
      expect(journals[0].morning.length).toBe(10000);
    });

    it('should handle special characters and Unicode', async () => {
      const unicodeEntry = {
        ...sampleJournalEntry,
        morning: 'Emoji test: 😊🌟🎉 Chinese: 你好 Arabic: مرحبا Russian: Привет',
        afternoon: 'Special chars: àáâãäåæçèéêë ñòóôõö ùúûüý',
        evening: 'Symbols: ©®™ ±×÷ ‹›«»'
      };

      const result = await saveJournalEntry(testUser.id, unicodeEntry);
      expect(result.acknowledged).toBe(true);

      const journals = await getUserJournals(testUser.id, 1);
      expect(journals[0].morning).toBe(unicodeEntry.morning);
      expect(journals[0].afternoon).toBe(unicodeEntry.afternoon);
      expect(journals[0].evening).toBe(unicodeEntry.evening);
    });
  });
});
