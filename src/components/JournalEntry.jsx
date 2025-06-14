import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeMood, analyzeFullDay } from '@/services/gemini';
import { saveJournalEntry } from '@/services/localStorage';
import { Sunrise, Sun, Moon, Brain, Loader2 } from 'lucide-react';

const JournalEntry = ({ user }) => {
  const [entries, setEntries] = useState({
    morning: '',
    afternoon: '',
    evening: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleEntryChange = (period, value) => {
    setEntries(prev => ({
      ...prev,
      [period]: value
    }));
  };

  const handleSubmit = async () => {
    if (!entries.morning.trim() || !entries.afternoon.trim() || !entries.evening.trim()) {
      alert('Please fill in all three journal entries before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Analyze each entry
      const [morningAnalysis, afternoonAnalysis, eveningAnalysis] = await Promise.all([
        analyzeMood(entries.morning),
        analyzeMood(entries.afternoon),
        analyzeMood(entries.evening)
      ]);

      // Get overall day analysis
      const dayAnalysis = await analyzeFullDay(
        entries.morning,
        entries.afternoon,
        entries.evening,
        morningAnalysis,
        afternoonAnalysis,
        eveningAnalysis
      );

      const fullAnalysis = {
        entries,
        morningAnalysis,
        afternoonAnalysis,
        eveningAnalysis,
        dayAnalysis,
        date: new Date().toISOString().split('T')[0]
      };

      // Save to database
      await saveJournalEntry(user.id, {
        ...entries,
        morningMood: morningAnalysis.mood,
        morningScore: morningAnalysis.score,
        morningTip: morningAnalysis.tip,
        afternoonMood: afternoonAnalysis.mood,
        afternoonScore: afternoonAnalysis.score,
        afternoonTip: afternoonAnalysis.tip,
        eveningMood: eveningAnalysis.mood,
        eveningScore: eveningAnalysis.score,
        eveningTip: eveningAnalysis.tip,
        overallMood: dayAnalysis.overallMood,
        overallScore: dayAnalysis.overallScore,
        dailySummary: dayAnalysis.dailySummary,
        date: new Date().toISOString().split('T')[0]
      });

      setAnalysis(fullAnalysis);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting journal:', error);
      alert('Failed to submit journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewEntry = () => {
    setEntries({ morning: '', afternoon: '', evening: '' });
    setAnalysis(null);
    setSubmitted(false);
  };

  const getMoodColor = (mood) => {
    const colors = {
      Happy: 'text-green-600 bg-green-50',
      Sad: 'text-blue-600 bg-blue-50',
      Anxious: 'text-yellow-600 bg-yellow-50',
      Excited: 'text-orange-600 bg-orange-50',
      Stressed: 'text-red-600 bg-red-50',
      Angry: 'text-red-700 bg-red-100',
      Content: 'text-green-500 bg-green-50',
      Confused: 'text-purple-600 bg-purple-50',
      Hopeful: 'text-blue-500 bg-blue-50',
      Neutral: 'text-gray-600 bg-gray-50'
    };
    return colors[mood] || 'text-gray-600 bg-gray-50';
  };

  if (submitted && analysis) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Journal Analysis Complete</h2>
          <p className="text-gray-600">Here's your AI-powered mood analysis for today</p>
        </div>

        {/* Overall Day Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Daily Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-600">Overall Mood</span>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${getMoodColor(analysis.dayAnalysis.overallMood)}`}>
                  {analysis.dayAnalysis.overallMood}
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600">Mood Score</span>
                <div className="text-2xl font-bold text-primary">
                  {analysis.dayAnalysis.overallScore}/10
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {analysis.dayAnalysis.dailySummary}
            </p>
          </CardContent>
        </Card>

        {/* Individual Period Analysis */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Morning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sunrise className="h-4 w-4 text-orange-500" />
                Morning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getMoodColor(analysis.morningAnalysis.mood)}`}>
                {analysis.morningAnalysis.mood} ({analysis.morningAnalysis.score}/10)
              </div>
              <p className="text-sm text-gray-600 mb-2">Your entry:</p>
              <p className="text-sm italic text-gray-800 mb-3">"{entries.morning}"</p>
              <p className="text-sm text-primary font-medium">💡 Tip:</p>
              <p className="text-sm text-gray-700">{analysis.morningAnalysis.tip}</p>
            </CardContent>
          </Card>

          {/* Afternoon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-4 w-4 text-yellow-500" />
                Afternoon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getMoodColor(analysis.afternoonAnalysis.mood)}`}>
                {analysis.afternoonAnalysis.mood} ({analysis.afternoonAnalysis.score}/10)
              </div>
              <p className="text-sm text-gray-600 mb-2">Your entry:</p>
              <p className="text-sm italic text-gray-800 mb-3">"{entries.afternoon}"</p>
              <p className="text-sm text-primary font-medium">💡 Tip:</p>
              <p className="text-sm text-gray-700">{analysis.afternoonAnalysis.tip}</p>
            </CardContent>
          </Card>

          {/* Evening */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-4 w-4 text-indigo-500" />
                Evening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getMoodColor(analysis.eveningAnalysis.mood)}`}>
                {analysis.eveningAnalysis.mood} ({analysis.eveningAnalysis.score}/10)
              </div>
              <p className="text-sm text-gray-600 mb-2">Your entry:</p>
              <p className="text-sm italic text-gray-800 mb-3">"{entries.evening}"</p>
              <p className="text-sm text-primary font-medium">💡 Tip:</p>
              <p className="text-sm text-gray-700">{analysis.eveningAnalysis.tip}</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={handleNewEntry} size="lg">
            Write New Journal Entry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Journal</h2>
        <p className="text-gray-600">Share your thoughts and feelings for each part of your day</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Morning Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sunrise className="h-5 w-5 text-orange-500" />
              Morning Journal
            </CardTitle>
            <CardDescription>
              How did you start your day? What are your thoughts and feelings this morning?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe your morning thoughts, feelings, and experiences..."
              value={entries.morning}
              onChange={(e) => handleEntryChange('morning', e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Afternoon Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              Afternoon Journal
            </CardTitle>
            <CardDescription>
              How is your day progressing? What's on your mind this afternoon?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share your afternoon experiences, challenges, or successes..."
              value={entries.afternoon}
              onChange={(e) => handleEntryChange('afternoon', e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Evening Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Evening Journal
            </CardTitle>
            <CardDescription>
              How are you ending your day? Reflect on your evening thoughts and feelings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Reflect on your day, evening activities, and how you're feeling..."
              value={entries.evening}
              onChange={(e) => handleEntryChange('evening', e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !entries.morning.trim() || !entries.afternoon.trim() || !entries.evening.trim()}
          size="lg"
          className="px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Submit & Get AI Analysis
            </>
          )}
        </Button>
        
        {(!entries.morning.trim() || !entries.afternoon.trim() || !entries.evening.trim()) && (
          <p className="text-sm text-gray-500 mt-2">
            Please fill in all three entries to submit
          </p>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;
