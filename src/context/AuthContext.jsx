import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate session on mount by calling GET /auth/user (uses httpOnly cookie)
  const hydrate = async () => {
    try {
      const response = await axiosInstance.get('/auth/user');
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
      }
    } catch (err) {
      // No valid session — user stays null
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const login = async (identifier, password) => {
    try {
      // identifier can be email or userName
      const isEmail = identifier.includes('@');
      const payload = isEmail
        ? { email: identifier, password }
        : { userName: identifier, password };

      const response = await axiosInstance.post('/auth/login', payload);
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      return { success: false, message: response.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userName, name, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', { userName, name, email, password });
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data?.message || 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return { success: true, message: response.data?.message || 'If an account exists, a reset link has been sent.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to process request.',
      };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password, confirmPassword });
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data?.message || 'Reset failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Password reset failed.',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, hydrate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
