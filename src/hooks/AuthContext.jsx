import React, { createContext, useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';
import URLS from '../utilities/Endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    // Tell the backend to blacklist the current token
    try {
      await DatabaseService.POST(URLS.AUTH.LOGOUT, {});
    } catch (_) {
      // Ignore — token may already be expired; we still clear local state
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('businessId');
    localStorage.removeItem('kioskId');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  // Register the logout function with DatabaseService when AuthProvider mounts
  useEffect(() => {
    DatabaseService.setLogoutCallback(logout);
  }, [logout]); // Depend on logout to ensure the latest version is registered

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;