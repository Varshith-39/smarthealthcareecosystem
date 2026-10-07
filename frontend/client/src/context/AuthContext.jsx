import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smart_health_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_health_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('smart_health_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await API.post('/auth/login', { email, password, role });
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('smart_health_token', newToken);
      localStorage.setItem('smart_health_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    if (res.data?.success) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('smart_health_token', newToken);
      localStorage.setItem('smart_health_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_health_token');
    localStorage.removeItem('smart_health_user');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('smart_health_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isPatient: user?.role === 'PATIENT',
        isDoctor: user?.role === 'DOCTOR',
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
