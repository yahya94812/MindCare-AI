import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getJournalEntries, getJournalStats } from '@/services/localStorage';
import { generateMonthlyInsights } from '@/services/gemini';
import { TrendingUp, Calendar, Brain, Loader2 } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [journalData, setJournalData] = useState([]);
  const [monthlyInsights, setMonthlyInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const journals = getJournalEntries(user.id, 30); // Get last 30 entries
      
      // Format data for charts
      const chartData = journals.map(journal => ({
        date: new Date(journal.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: journal.createdAt,
        overallScore: journal.overallScore || 0,
        morningScore: journal.morningScore || 0,
        afternoonScore: journal.afternoonScore || 0,
        eveningScore: journal.eveningScore || 0,
        mood: journal.overallMood || 'Neutral'
      })).reverse(); // Show oldest to newest

      setJournalData(chartData);

      // Generate AI insights
      if (journals.length > 0) {
        setInsightsLoading(true);
        try {
          const insights = await generateMonthlyInsights(journals);
          setMonthlyInsights(insights.monthlyInsights);
        } catch (error) {
          console.error('Error generating insights:', error);
          setMonthlyInsights('Unable to generate insights at this time. Please try again later.');
        }
        setInsightsLoading(false);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageScore = () => {
    if (journalData.length === 0) return 0;
    const sum = journalData.reduce((acc, entry) => acc + entry.overallScore, 0);
    return (sum / journalData.length).toFixed(1);
  };

  const getMoodDistribution = () => {
    const moodCounts = {};
    journalData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: ((count / journalData.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMoodColor = (mood) => {
    const colors = {
      Happy: '#10B981',
      Sad: '#3B82F6',
      Anxious: '#F59E0B',
      Excited: '#F97316',
      Stressed: '#EF4444',
      Angry: '#DC2626',
      Content: '#10B981',
      Confused: '#8B5CF6',
      Hopeful: '#06B6D4',
      Neutral: '#6B7280'
    };
    return colors[mood] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (journalData.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Journal Entries Yet</h3>
        <p className="text-gray-600 mb-6">
          Start journaling to see your mood trends and insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wellness Dashboard</h2>
        <p className="text-gray-600">Track your emotional journey and gain insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalData.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Mood Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(getAverageScore())}`}>
              {getAverageScore()}/10
            </div>
            <p className="text-xs text-muted-foreground">Overall wellbeing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getMoodDistribution()[0]?.mood || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {getMoodDistribution()[0]?.percentage || 0}% of entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Mood Trends
          </CardTitle>
          <CardDescription>
            Your mood scores over time (1-10 scale)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={journalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[1, 10]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-primary">
                            Overall Score: {payload[0].value}/10
                          </p>
                          <p className="text-sm text-gray-600">
                            Mood: {journalData.find(d => d.date === label)?.mood}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overallScore" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Mood Breakdown</CardTitle>
          <CardDescription>
            Compare morning, afternoon, and evening moods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={journalData.slice(-7)}> {/* Show last 7 days */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[1, 10]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar dataKey="morningScore" fill="#F59E0B" name="Morning" />
                <Bar dataKey="afternoonScore" fill="#EAB308" name="Afternoon" />
                <Bar dataKey="eveningScore" fill="#6366F1" name="Evening" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
          <CardDescription>
            Breakdown of your emotional states over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getMoodDistribution().map((moodData, index) => (
              <div key={moodData.mood} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getMoodColor(moodData.mood) }}
                  ></div>
                  <span className="font-medium">{moodData.mood}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${moodData.percentage}%`,
                        backgroundColor: getMoodColor(moodData.mood)
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {moodData.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Monthly Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Monthly Behavior Insights
          </CardTitle>
          <CardDescription>
            AI-generated analysis of your emotional patterns and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Generating insights...</span>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {monthlyInsights}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
