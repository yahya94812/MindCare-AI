import { useState, useEffect } from 'react';

// Simple in-memory user storage
const STORAGE_KEY = 'mindcare_user';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login with a default user for local usage
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Create a default user for local usage
      const defaultUser = {
        id: 'local-user',
        name: 'Local User',
        createdAt: new Date().toISOString(),
        picture: 'https://ui-avatars.com/api/?name=Local+User&background=2563eb&color=fff&size=40'
      };
      setUser(defaultUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
    }
    setLoading(false);
  }, []);

  const createUser = (name) => {
    const userData = {
      id: 'local-user',
      name: name || 'Local User',
      createdAt: new Date().toISOString(),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Local User')}&background=2563eb&color=fff&size=40`
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('mindcare_journals');
    setUser(null);
    // Reload the page to reset the app state
    window.location.reload();
  };

  return {
    user,
    loading,
    createUser,
    logout,
    isAuthenticated: !!user
  };
};
