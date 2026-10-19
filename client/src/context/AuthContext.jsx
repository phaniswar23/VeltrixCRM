import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('veltrix_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('veltrix_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token from localStorage and fetch current user
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('veltrix_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('veltrix_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Auth token expired or invalid');
          setUser(null);
          setToken(null);
          localStorage.removeItem('veltrix_token');
          localStorage.removeItem('veltrix_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('veltrix_token', newToken);
    localStorage.setItem('veltrix_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('veltrix_token', newToken);
    localStorage.setItem('veltrix_user', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('veltrix_token');
      localStorage.removeItem('veltrix_user');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
