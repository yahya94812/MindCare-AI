// Application Configuration
export const config = {
  // Gemini AI Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  },

  // Application Settings
  app: {
    name: 'MindCare AI',
    description: 'Your Personal Mental Wellness Companion',
    version: '1.0.0',
    storage: 'localStorage' // Using local storage instead of MongoDB
  }
};
