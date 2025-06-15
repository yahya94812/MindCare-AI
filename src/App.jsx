import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useTabs } from '@/hooks/useTabs';
import AuthPage from '@/components/AuthPage';
import JournalEntry from '@/components/JournalEntry';
import Dashboard from '@/components/Dashboard';
import { BookOpen, BarChart3, User, Brain, Edit3, LogOut, Trash2 } from 'lucide-react';

function App() {
  const { user, loading, login, register, logout, clearAllData, isAuthenticated } = useAuth();
  const { activeTab, setTab, isActive } = useTabs('journal');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleEditName = () => {
    setNewName(user?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      // Update user name (you might want to implement this in useAuth)
      const updatedUser = { ...user, name: newName.trim() };
      localStorage.setItem('mindcare_user', JSON.stringify(updatedUser));
      window.location.reload(); // Simple way to refresh the user data
    }
    setIsEditingName(false);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto text-primary animate-pulse mb-4" />
          <p className="text-gray-600">Loading MindCare AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={login} onRegister={register} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MindCare AI</h1>
                <p className="text-sm text-gray-600">Your wellness companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
                <div className="hidden sm:block">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-6 text-sm w-32"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                        onBlur={handleSaveName}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <Button
                        onClick={handleEditName}
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <Edit3 className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
                
                <Button
                  onClick={handleClearData}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Data</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger 
              value="journal" 
              onClick={() => setTab('journal')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Journal Entry
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              onClick={() => setTab('dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className={isActive('journal') ? 'block' : 'hidden'}>
            <JournalEntry user={user} />
          </TabsContent>

          <TabsContent value="dashboard" className={isActive('dashboard') ? 'block' : 'hidden'}>
            <Dashboard user={user} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 MindCare AI. Built with React, TailwindCSS, and AI-powered insights.</p>
            <p className="mt-1">Your mental wellness journey, enhanced by technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
