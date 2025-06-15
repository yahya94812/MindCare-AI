import { useState, useEffect } from 'react';

// Storage keys
const STORAGE_KEY = 'mindcare_user';
const USERS_KEY = 'mindcare_users';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const getStoredUsers = () => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (userData) => {
    const users = getStoredUsers();
    const existingUserIndex = users.findIndex(u => u.email === userData.email);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = userData;
    } else {
      users.push(userData);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const users = getStoredUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const userData = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=40`
      };

      // Save user to storage
      saveUser(userData);
      
      // Remove password from user object for session storage
      const { password: _, ...userSession } = userData;
      setUser(userSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Find user
      const users = getStoredUsers();
      const user = users.find(u => u.email === email.trim().toLowerCase());
      
      if (!user) {
        throw new Error('No account found with this email');
      }

      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Remove password from user object for session storage
      const { password: _, ...userSession } = user;
      setUser(userSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem('mindcare_journals');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    clearAllData,
    isAuthenticated: !!user
  };
};
