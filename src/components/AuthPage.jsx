import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Heart, BookOpen, Info, User, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const AuthPage = ({ onLogin, onRegister }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = isSignUp
        ? await onRegister(formData.name, formData.email, formData.password)
        : await onLogin(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Brain className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MindCare AI</h1>
          <p className="text-gray-600">Your personal wellness companion</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Start your wellness journey today'
                : 'Sign in to continue your wellness journey'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <Info className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-1 text-primary hover:text-primary/80 font-medium"
                  disabled={loading}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-gray-600">AI-Powered Journal</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Mood Tracking</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Personal Insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
