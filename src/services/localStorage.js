// Local Storage Service - Replaces MongoDB functionality
const JOURNALS_KEY = 'mindcare_journals';
const USER_KEY = 'mindcare_user';

// Journal Entry Management
export const saveJournalEntry = (userId, journalData) => {
  try {
    const journals = getJournalEntries(userId);
    const newEntry = {
      ...journalData,
      id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    journals.push(newEntry);
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    return { acknowledged: true, insertedId: newEntry.id };
  } catch (error) {
    console.error('Failed to save journal entry:', error);
    throw new Error('Failed to save journal entry');
  }
};

export const getJournalEntries = (userId, limit = null) => {
  try {
    const stored = localStorage.getItem(JOURNALS_KEY);
    const allJournals = stored ? JSON.parse(stored) : [];
    
    // Filter by userId and sort by creation date (newest first)
    let userJournals = allJournals
      .filter(journal => journal.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (limit) {
      userJournals = userJournals.slice(0, limit);
    }
    
    return userJournals;
  } catch (error) {
    console.error('Failed to get journal entries:', error);
    return [];
  }
};

export const deleteJournalEntry = (userId, entryId) => {
  try {
    const journals = getJournalEntries();
    const filteredJournals = journals.filter(journal => 
      !(journal.userId === userId && journal.id === entryId)
    );
    
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(filteredJournals));
    return { acknowledged: true, deletedCount: 1 };
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    throw new Error('Failed to delete journal entry');
  }
};

export const updateJournalEntry = (userId, entryId, updateData) => {
  try {
    const journals = JSON.parse(localStorage.getItem(JOURNALS_KEY) || '[]');
    const entryIndex = journals.findIndex(journal => 
      journal.userId === userId && journal.id === entryId
    );
    
    if (entryIndex === -1) {
      throw new Error('Journal entry not found');
    }
    
    journals[entryIndex] = {
      ...journals[entryIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(JOURNALS_KEY, JSON.stringify(journals));
    return { acknowledged: true, modifiedCount: 1 };
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    throw new Error('Failed to update journal entry');
  }
};

// User Management
export const getUser = (userId) => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

export const createUser = (userData) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return { acknowledged: true };
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
};

// Analytics and Statistics
export const getJournalStats = (userId) => {
  try {
    const journals = getJournalEntries(userId);
    
    if (journals.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        moodTrend: [],
        commonThemes: [],
        weeklyActivity: []
      };
    }
    
    // Calculate mood statistics
    const moods = journals
      .filter(journal => journal.mood)
      .map(journal => journal.mood);
    
    const averageMood = moods.length > 0 
      ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length 
      : 0;
    
    // Get mood trend (last 7 entries)
    const moodTrend = journals
      .slice(0, 7)
      .reverse()
      .map(journal => ({
        date: new Date(journal.createdAt).toLocaleDateString(),
        mood: journal.mood || 0
      }));
    
    // Extract common themes from analysis
    const themes = journals
      .filter(journal => journal.analysis?.themes)
      .flatMap(journal => journal.analysis.themes)
      .reduce((acc, theme) => {
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {});
    
    const commonThemes = Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
    
    // Weekly activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayEntries = journals.filter(journal => 
        new Date(journal.createdAt).toDateString() === dateStr
      ).length;
      
      return {
        date: date.toLocaleDateString(),
        entries: dayEntries
      };
    }).reverse();
    
    return {
      totalEntries: journals.length,
      averageMood: Math.round(averageMood * 10) / 10,
      moodTrend,
      commonThemes,
      weeklyActivity
    };
  } catch (error) {
    console.error('Failed to get journal stats:', error);
    return {
      totalEntries: 0,
      averageMood: 0,
      moodTrend: [],
      commonThemes: [],
      weeklyActivity: []
    };
  }
};

// Clear all data (for reset functionality)
export const clearAllData = () => {
  try {
    localStorage.removeItem(JOURNALS_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw new Error('Failed to clear data');
  }
};
