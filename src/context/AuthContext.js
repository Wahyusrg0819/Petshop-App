import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');

      console.log('Checking auth status - Token:', token, 'Role:', role);

      if (token && role) {
        await getUserProfile(token);
        setIsLoggedIn(true);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async (token) => {
    try {
      const response = await axios.get('http://172.20.10.2:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User profile data:', response.data);

      const profile = response.data?.user;
      if (profile && profile.userId) {
        setUserData({
          user_id: profile.userId,
          email: profile.email,
          name: profile.name,
          profilePicture: profile.profilePicture,
        });
      } else {
        throw new Error('Invalid profile data');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for email:', email);

      const response = await axios.post('http://172.20.10.2:5000/api/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);

      const { accessToken: token, role, user } = response.data;

      if (!token || !role || !user || !user.user_id) {
        throw new Error('Token, role, atau user data tidak ditemukan dalam respons');
      }

      await AsyncStorage.multiSet([
        ['authToken', token],
        ['userRole', role.toLowerCase().trim()],
      ]);

      setUserData(user);
      setIsLoggedIn(true);
      setUserRole(role.toLowerCase().trim());

      console.log('Login successful - User data:', user);
      console.log('isLoggedIn set to:', true);
      console.log('userRole set to:', role.toLowerCase().trim());

      return { success: true, role: role.toLowerCase().trim() };
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        error.response?.data?.message || 'Gagal login. Silakan coba lagi.'
      );
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove(['authToken', 'userRole']);

      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);

      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoggedIn,
    isLoading,
    userRole,
    userData,
    login,
    logout,
    checkAuthStatus,
    updateUserDataIfEmpty: async () => {
      if (!userData || !userData.user_id) {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          await getUserProfile(token);
        }
      }
    },
  };

  console.log('AuthContext current state:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};

export default AuthContext;
