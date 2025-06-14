// MongoDB Demo Mode Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getUser, 
  createUser, 
  saveJournalEntry, 
  getUserJournals, 
  getMonthlyJournals 
} from '../src/services/mongodb.js';

// Mock the demo service
vi.mock('../src/services/demo.js', () => ({
  demoMode: {
    isEnabled: vi.fn()
  },
  demoStorage: {
    getUser: vi.fn(),
    saveUser: vi.fn(),
    saveJournal: vi.fn(),
    getJournals: vi.fn()
  }
}));

describe('MongoDB Demo Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Demo Mode Detection', () => {
    it('should use demo storage when demo mode is enabled', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      // Mock demo mode as enabled
      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.getUser.mockReturnValue({ id: 'demo_user', name: 'Demo User' });

      const user = await getUser('demo_user');
      
      expect(demoMode.isEnabled).toHaveBeenCalled();
      expect(demoStorage.getUser).toHaveBeenCalled();
      expect(user).toEqual({ id: 'demo_user', name: 'Demo User' });
    });

    it('should save user to demo storage in demo mode', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.saveUser.mockReturnValue(undefined);

      const testUser = { id: 'test_user', name: 'Test User' };
      const result = await createUser(testUser);

      expect(demoStorage.saveUser).toHaveBeenCalledWith(testUser);
      expect(result).toEqual({ acknowledged: true });
    });

    it('should save journal to demo storage in demo mode', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.saveJournal.mockReturnValue(undefined);

      const journalData = { morning: 'Test morning', afternoon: 'Test afternoon' };
      const result = await saveJournalEntry('user123', journalData);

      expect(demoStorage.saveJournal).toHaveBeenCalledWith({ 
        userId: 'user123', 
        ...journalData 
      });
      expect(result).toEqual({ acknowledged: true });
    });

    it('should retrieve journals from demo storage in demo mode', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      const mockJournals = [
        { userId: 'user123', morning: 'Entry 1', createdAt: new Date('2024-01-01') },
        { userId: 'user123', morning: 'Entry 2', createdAt: new Date('2024-01-02') },
        { userId: 'user456', morning: 'Other user entry', createdAt: new Date('2024-01-01') }
      ];

      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.getJournals.mockReturnValue(mockJournals);

      const journals = await getUserJournals('user123', 10);

      expect(demoStorage.getJournals).toHaveBeenCalled();
      expect(journals).toHaveLength(2);
      expect(journals[0].morning).toBe('Entry 2'); // Should be sorted newest first
      expect(journals[1].morning).toBe('Entry 1');
    });

    it('should filter monthly journals correctly in demo mode', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      const now = new Date();
      const recentDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
      const oldDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago

      const mockJournals = [
        { userId: 'user123', morning: 'Recent entry', createdAt: recentDate },
        { userId: 'user123', morning: 'Old entry', createdAt: oldDate }
      ];

      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.getJournals.mockReturnValue(mockJournals);

      const monthlyJournals = await getMonthlyJournals('user123');

      expect(monthlyJournals).toHaveLength(1);
      expect(monthlyJournals[0].morning).toBe('Recent entry');
    });
  });

  describe('Demo Mode Environment Detection', () => {
    it('should detect demo mode based on environment variables', async () => {
      // This test verifies the demo mode detection logic
      const originalGemini = process.env.VITE_GEMINI_API_KEY;
      const originalMongo = process.env.VITE_MONGODB_URI;

      // Test demo gemini key
      process.env.VITE_GEMINI_API_KEY = 'demo_gemini_api_key';
      process.env.VITE_MONGODB_URI = 'mongodb://real:27017';

      // Import fresh module to test environment detection
      vi.resetModules();
      const { demoMode } = await import('../src/services/demo.js');
      
      expect(demoMode.isEnabled()).toBe(true);

      // Test demo mongo URI
      process.env.VITE_GEMINI_API_KEY = 'real_key';
      process.env.VITE_MONGODB_URI = 'mongodb+srv://demo:demo@cluster.mongodb.net/test';

      vi.resetModules();
      const { demoMode: demoMode2 } = await import('../src/services/demo.js');
      
      expect(demoMode2.isEnabled()).toBe(true);

      // Restore original values
      process.env.VITE_GEMINI_API_KEY = originalGemini;
      process.env.VITE_MONGODB_URI = originalMongo;
    });
  });

  describe('Error Handling in Demo Mode', () => {
    it('should handle empty demo storage gracefully', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      demoMode.isEnabled.mockReturnValue(true);
      demoStorage.getUser.mockReturnValue(null);
      demoStorage.getJournals.mockReturnValue([]);

      const user = await getUser('nonexistent');
      const journals = await getUserJournals('nonexistent');

      expect(user).toBeNull();
      expect(journals).toEqual([]);
    });

    it('should handle malformed demo data', async () => {
      const { demoMode, demoStorage } = await import('../src/services/demo.js');
      
      demoMode.isEnabled.mockReturnValue(true);
      
      // Mock malformed journal data
      const malformedJournals = [
        { userId: 'user123' }, // Missing required fields
        { morning: 'Entry without user' }, // Missing userId
        { userId: 'user123', createdAt: 'invalid-date' } // Invalid date
      ];
      
      demoStorage.getJournals.mockReturnValue(malformedJournals);

      const journals = await getUserJournals('user123');
      
      // Should filter out entries without proper userId
      expect(journals).toHaveLength(2);
      expect(journals.every(j => j.userId === 'user123')).toBe(true);
    });
  });
});
