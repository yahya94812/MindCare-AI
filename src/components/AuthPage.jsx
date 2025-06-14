import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { demoMode, demoUser } from '@/services/demo';
import { Brain, Heart, BookOpen, Info, User, Lock, Loader2 } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDemoMode = demoMode.isEnabled();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = isSignUp 
        ? await onLogin.register(formData.name, formData.password)
        : await onLogin.login(formData.name, formData.password);

      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin.register('Demo User', 'demo123');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({ name: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MindCare AI</h1>
          <p className="text-gray-600">Your personal mental wellness companion</p>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> You're running MindCare AI in demo mode. All features work with simulated data. 
              No real API keys are required. Check the SETUP.md file to configure real services.
            </AlertDescription>
          </Alert>
        )}

        {/* Features Cards */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Daily Journaling</h3>
              <p className="text-xs text-gray-600">Track your mood throughout the day</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">AI Insights</h3>
              <p className="text-xs text-gray-600">Get personalized tips and analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
            <Heart className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Mood Tracking</h3>
              <p className="text-xs text-gray-600">Visualize your emotional journey</p>
            </div>
          </div>
        </div>

        {/* Login/Signup Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Sign up to start your wellness journey'
                : 'Sign in to continue your wellness journey'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDemoMode ? (
              <Button 
                onClick={handleDemoLogin}
                className="w-full"
                size="lg"
              >
                <Brain className="w-5 h-5 mr-2" />
                Try Demo Version
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-primary hover:underline"
                    disabled={loading}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </form>
            )}

            <p className="text-xs text-center text-gray-600 mt-4">
              {isDemoMode 
                ? "Demo mode uses simulated data and doesn't require any setup"
                : "Your data is stored locally and securely"
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
