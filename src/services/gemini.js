// Gemini API Service
import { demoMode, demoAnalyzeMood, demoAnalyzeFullDay, demoGenerateMonthlyInsights } from './demo.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const analyzeMood = async (journalEntry) => {
  // Use demo mode if API key is not configured
  if (demoMode.isEnabled()) {
    return await demoAnalyzeMood(journalEntry);
  }

  try {
    const prompt = `
    Analyze the following journal entry and provide:
    1. A mood classification (Happy, Sad, Neutral, Anxious, Excited, Stressed, Angry, Content, Confused, Hopeful)
    2. A mood score from 1-10 (1 being very negative, 10 being very positive)
    3. A brief personalized tip or suggestion (max 100 words)

    Journal entry: "${journalEntry}"

    Please respond in the following JSON format:
    {
      "mood": "mood_classification",
      "score": mood_score_number,
      "tip": "personalized_tip_here"
    }
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Parse JSON from AI response
    const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Error analyzing mood:', error);
    // Fallback response
    return {
      mood: 'Neutral',
      score: 5,
      tip: 'Take some time to reflect on your day and practice mindfulness.'
    };
  }
};

export const analyzeFullDay = async (morningEntry, afternoonEntry, eveningEntry, morningMood, afternoonMood, eveningMood) => {
  // Use demo mode if API key is not configured
  if (demoMode.isEnabled()) {
    return await demoAnalyzeFullDay(morningEntry, afternoonEntry, eveningEntry, morningMood, afternoonMood, eveningMood);
  }

  try {
    const prompt = `
    Analyze a full day of journal entries and provide:
    1. An overall mood for the day
    2. An overall mood score (1-10)
    3. A comprehensive daily summary and tip (max 150 words)

    Morning entry: "${morningEntry}" (Mood: ${morningMood.mood}, Score: ${morningMood.score})
    Afternoon entry: "${afternoonEntry}" (Mood: ${afternoonMood.mood}, Score: ${afternoonMood.score})
    Evening entry: "${eveningEntry}" (Mood: ${eveningMood.mood}, Score: ${eveningMood.score})

    Please respond in the following JSON format:
    {
      "overallMood": "mood_classification",
      "overallScore": average_score_number,
      "dailySummary": "comprehensive_daily_summary_and_tip"
    }
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Error analyzing full day:', error);
    const avgScore = Math.round((morningMood.score + afternoonMood.score + eveningMood.score) / 3);
    return {
      overallMood: 'Neutral',
      overallScore: avgScore,
      dailySummary: 'Your day had varying emotions. Continue to practice self-awareness and mindfulness.'
    };
  }
};

export const generateMonthlyInsights = async (journals) => {
  // Use demo mode if API key is not configured
  if (demoMode.isEnabled()) {
    return await demoGenerateMonthlyInsights(journals);
  }

  try {
    const journalSummary = journals.map(j => 
      `Date: ${j.createdAt.toDateString()}, Overall Mood: ${j.overallMood}, Score: ${j.overallScore}`
    ).join('\n');

    const prompt = `
    Analyze the following month of journal data and provide insights:
    ${journalSummary}

    Please provide:
    1. Overall behavior patterns observed
    2. Mood trends and fluctuations
    3. Personalized recommendations for improvement
    4. Positive highlights from the month

    Respond in JSON format:
    {
      "monthlyInsights": "comprehensive_monthly_analysis_and_recommendations"
    }
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Error generating monthly insights:', error);
    return {
      monthlyInsights: 'Keep maintaining your journaling habit. Regular self-reflection contributes to better mental health and self-awareness.'
    };
  }
};
