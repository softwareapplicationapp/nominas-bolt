'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  role: string;
  companyId: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName: string, industry?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (error) {
        // If stored user data is corrupted, clear everything
        apiClient.clearToken();
        setLoading(false);
      }
    } else if (token) {
      // Token exists but no user data, verify token by making a test request
      apiClient.getDashboardStats()
        .then(() => {
          // Token is valid but we don't have user info stored
          // This shouldn't happen in normal flow, but handle gracefully
          apiClient.clearToken();
        })
        .catch((error) => {
          // Token is invalid or expired
          apiClient.clearToken();
          console.log('Token validation failed:', error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
    } catch (error) {
      // Clear any stale tokens on login failure
      apiClient.clearToken();
      throw error;
    }
  };

  const register = async (email: string, password: string, companyName: string, industry?: string) => {
    try {
      const response = await apiClient.register(email, password, companyName, industry);
      setUser(response.user);
    } catch (error) {
      // Clear any stale tokens on registration failure
      apiClient.clearToken();
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}