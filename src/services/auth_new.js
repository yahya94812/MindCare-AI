// Simple Name/Password Authentication Service

// Simple user authentication with name and password
export const signUp = async (name, password) => {
  try {
    // Check if user already exists
    const existingUser = getUserFromStorage();
    if (existingUser && existingUser.name === name) {
      throw new Error('User already exists with this name');
    }

    // Create new user
    const userData = {
      id: Date.now().toString(), // Simple ID generation
      name: name.trim(),
      password: password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=40`
    };

    // Save to localStorage
    saveUserToStorage(userData);
    return userData;
  } catch (error) {
    throw new Error(error.message || 'Failed to create account');
  }
};

export const signIn = async (name, password) => {
  try {
    const userData = getUserFromStorage();
    
    if (!userData) {
      throw new Error('No account found. Please sign up first.');
    }

    if (userData.name !== name.trim()) {
      throw new Error('Invalid username');
    }

    if (userData.password !== password) {
      throw new Error('Invalid password');
    }

    return userData;
  } catch (error) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

export const signOut = () => {
  // Clear local storage and reset app state
  clearUserFromStorage();
  // Clear demo data as well
  localStorage.removeItem('mindcare_demo_journals');
  window.location.reload();
};

// Local storage helpers
export const saveUserToStorage = (user) => {
  // Remove password from stored user data for security
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem('mindcare_user', JSON.stringify({
    ...userWithoutPassword,
    hasPassword: true // Flag to indicate user has password set
  }));
  // Store password separately (in production, this should be properly secured)
  localStorage.setItem('mindcare_user_auth', password);
};

export const getUserFromStorage = () => {
  const user = localStorage.getItem('mindcare_user');
  const password = localStorage.getItem('mindcare_user_auth');
  
  if (user && password) {
    const userData = JSON.parse(user);
    return {
      ...userData,
      password: password
    };
  }
  return null;
};

export const clearUserFromStorage = () => {
  localStorage.removeItem('mindcare_user');
  localStorage.removeItem('mindcare_user_auth');
};
