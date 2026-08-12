import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await API.get('/users/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Auth check failed", err);
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
