import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/client';

const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set the in-memory access token and decode user data
  const setToken = (token) => {
    if (token) {
      setAccessToken(token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        });
      }
    } else {
      setAccessToken(null);
      setUser(null);
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  };

  // Silently refresh token on page load
  const hydrate = async () => {
    try {
      // The endpoint will verify refresh-token httpOnly cookie
      const response = await axiosInstance.post('/auth/refresh');
      if (response.data && response.data.accessToken) {
        setToken(response.data.accessToken);
      }
    } catch (err) {
      // Refresh token expired or doesn't exist
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      if (response.data && response.data.accessToken) {
        setToken(response.data.accessToken);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axiosInstance.post('/auth/register', { username, email, password });
      return { success: true };
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
      console.error('Logout error on backend', err);
    } finally {
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, setToken }}>
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
export { decodeToken };
