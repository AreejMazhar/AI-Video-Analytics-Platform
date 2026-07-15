import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    console.log('🔍 Checking session...');
    console.log('  Token exists?', !!token);
    console.log('  User exists?', !!storedUser);
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('✅ Session restored:', parsedUser);
      } catch (e) {
        console.error('❌ Failed to parse user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    } else {
      console.log('⚠️ No session found');
    }
    setIsChecking(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    console.log('🔑 Attempting login...');
    try {
      const response = await authService.login(email, password);
      console.log('✅ Login successful:', response);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    console.log('👋 Logged out');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isChecking,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};