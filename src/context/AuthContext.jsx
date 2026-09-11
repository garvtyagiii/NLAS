import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on initial load

  // Restore session from storage
  useEffect(() => {
    const token = localStorage.getItem('nlas_token');
    const savedUser = localStorage.getItem('nlas_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('nlas_user');
      }
    }
    setLoading(false);
  }, []);

  // Listen for session expiry
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };
    window.addEventListener('nlas:session-expired', handler);
    return () => window.removeEventListener('nlas:session-expired', handler);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { accessToken, user: userData } = res.data.data;
    localStorage.setItem('nlas_token', accessToken);
    localStorage.setItem('nlas_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('nlas_token');
    localStorage.removeItem('nlas_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
