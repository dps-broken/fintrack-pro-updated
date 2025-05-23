import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient'; // We'll create this next
import { jwtDecode } from 'jwt-decode'; // To decode for expiry check, not verification

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoadingAuth: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  checkAuthStatus: () => {},
  updateUserContext: () => {}, // For updating user details after profile edit
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const setAuthData = (userData, authToken) => {
    localStorage.setItem('authToken', authToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000; // to get in seconds
        if (decodedToken.exp < currentTime) {
          // Token expired
          clearAuthData();
        } else {
          // Token is valid, fetch user data
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await apiClient.get('/auth/me');
          setAuthData(response.data, storedToken);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
      }
    }
    setIsLoadingAuth(false);
  }, [clearAuthData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setAuthData(response.data, response.data.token); // Assuming token is part of user data response
      setIsLoadingAuth(false);
      return response.data; // Return user data for potential redirects or further action
    } catch (error) {
      setIsLoadingAuth(false);
      console.error('Login failed:', error.response ? error.response.data : error.message);
      throw error; // Re-throw to be caught by the form
    }
  };

  const signup = async (name, email, password) => {
    setIsLoadingAuth(true);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      setAuthData(response.data, response.data.token);
      setIsLoadingAuth(false);
      return response.data;
    } catch (error) {
      setIsLoadingAuth(false);
      console.error('Signup failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    // Optional: Call server logout endpoint if it invalidates tokens (e.g., with httpOnly cookies)
    // try {
    //   await apiClient.post('/auth/logout');
    // } catch (error) {
    //   console.error('Server logout failed:', error);
    // }
    clearAuthData();
  }, [clearAuthData]);

  const updateUserContext = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    // If token structure changes (e.g. with new claims), re-issue from backend
    // For now, assume token structure doesn't change with profile update
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isLoadingAuth,
        login,
        signup,
        logout,
        checkAuthStatus,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};