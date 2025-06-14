// Demo Service - Simulates API responses for demonstration
export const demoMode = {
  isEnabled: () => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const mongoUri = import.meta.env.VITE_MONGODB_URI;
    
    return (
      !geminiKey || geminiKey === 'demo_gemini_api_key' ||
      !mongoUri || mongoUri.includes('demo:demo')
    );
  }
};

// Demo mood analysis
export const demoAnalyzeMood = async (journalEntry) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const moods = ['Happy', 'Content', 'Neutral', 'Anxious', 'Sad', 'Excited', 'Stressed'];
  const randomMood = moods[Math.floor(Math.random() * moods.length)];
  const randomScore = Math.floor(Math.random() * 10) + 1;
  
  const tips = {
    Happy: "Keep up the positive energy! Consider sharing your joy with others.",
    Content: "You're in a good place. Practice gratitude for this peaceful state.",
    Neutral: "Take some time to reflect on what might bring you more joy today.",
    Anxious: "Try some deep breathing exercises or a short walk to calm your mind.",
    Sad: "It's okay to feel sad. Consider reaching out to a friend or practicing self-care.",
    Excited: "Channel this energy into something productive or creative!",
    Stressed: "Take a break, practice mindfulness, or try some relaxation techniques."
  };
  
  return {
    mood: randomMood,
    score: randomScore,
    tip: tips[randomMood]
  };
};

// Demo full day analysis
export const demoAnalyzeFullDay = async (morningEntry, afternoonEntry, eveningEntry, morningMood, afternoonMood, eveningMood) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const avgScore = Math.round((morningMood.score + afternoonMood.score + eveningMood.score) / 3);
  const dominantMood = [morningMood.mood, afternoonMood.mood, eveningMood.mood]
    .sort((a, b) => [morningMood.mood, afternoonMood.mood, eveningMood.mood].filter(x => x === b).length - 
                    [morningMood.mood, afternoonMood.mood, eveningMood.mood].filter(x => x === a).length)[0];
  
  const summaries = [
    "Your day showed a nice balance of emotions. The variety in your feelings suggests you're experiencing life fully and authentically.",
    "Today's emotional journey reflects natural human responses to daily experiences. Continue practicing mindfulness to stay aware of these patterns.",
    "Your mood progression throughout the day is completely normal. Consider what specific events or activities influenced your emotional state.",
    "The emotional shifts you experienced today show healthy emotional responsiveness. Keep journaling to maintain this self-awareness.",
    "Your day's emotional landscape shows resilience and adaptability. These are valuable traits for mental wellness."
  ];
  
  return {
    overallMood: dominantMood,
    overallScore: avgScore,
    dailySummary: summaries[Math.floor(Math.random() * summaries.length)]
  };
};

// Demo monthly insights
export const demoGenerateMonthlyInsights = async (journals) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const insights = [
    "Over the past month, you've shown remarkable consistency in your journaling practice. Your emotional awareness has likely improved through this regular reflection. The patterns show you tend to have higher energy in the mornings, with some variability in afternoon moods. Consider scheduling important tasks during your peak energy times.",
    
    "Your monthly data reveals a healthy range of emotions, indicating you're fully experiencing life's ups and downs. There's a slight trend toward more positive emotions on weekends, suggesting work-life balance awareness. Try incorporating some weekend activities into your weekday routine for better overall mood stability.",
    
    "The past month shows your emotional resilience and adaptability. You've navigated various moods effectively, demonstrating good emotional intelligence. Your evening reflections tend to be more thoughtful and grounded. Consider using evening time for planning and goal-setting activities.",
    
    "Your journaling reveals strong self-awareness and emotional processing skills. The variety in your daily experiences and emotional responses shows you're living an engaged life. Focus on maintaining the positive patterns you've established while being gentle with yourself during challenging periods."
  ];
  
  return {
    monthlyInsights: insights[Math.floor(Math.random() * insights.length)]
  };
};

// Demo data storage (localStorage)
export const demoStorage = {
  saveUser: (userData) => {
    localStorage.setItem('mindcare_demo_user', JSON.stringify(userData));
  },
  
  getUser: () => {
    const user = localStorage.getItem('mindcare_demo_user');
    return user ? JSON.parse(user) : null;
  },
  
  saveJournal: (journalData) => {
    const existing = JSON.parse(localStorage.getItem('mindcare_demo_journals') || '[]');
    existing.push({
      ...journalData,
      id: Date.now().toString(),
      createdAt: new Date()
    });
    localStorage.setItem('mindcare_demo_journals', JSON.stringify(existing));
  },
  
  getJournals: () => {
    return JSON.parse(localStorage.getItem('mindcare_demo_journals') || '[]');
  },
  
  clear: () => {
    localStorage.removeItem('mindcare_demo_user');
    localStorage.removeItem('mindcare_demo_journals');
  }
};

// Demo user for authentication
export const demoUser = {
  id: 'demo_user_123',
  name: 'Demo User',
  picture: 'https://ui-avatars.com/api/?name=Demo%20User&background=2563eb&color=fff&size=40'
};
