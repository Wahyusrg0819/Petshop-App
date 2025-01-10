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
      setIsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');

      if (!token || !role) {
        await logout();
        return;
      }

      try {
        await getUserProfile(token);
        setIsLoggedIn(true);
        setUserRole(role);
      } catch (error) {
        console.error('Error getting profile:', error);
        await logout();
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async (token) => {
    const response = await axios.get('http://172.20.10.3:5000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data?.user) {
      throw new Error('No user data received');
    }

    const profile = response.data.user;
    setUserData({
      user_id: profile.userId,
      email: profile.email,
      phone: profile.phone || '',
      username: profile.username || '',
      name: profile.name || '',
      profilePicture: profile.profilePicture || null,
      recipientName: profile.recipientName || '',
      notes: profile.notes || '',
      address: profile.address || '',
    });
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://172.20.10.3:5000/api/login', {
        email,
        password,
      });

      const { accessToken: token, role, user } = response.data;

      if (!token || !role || !user || !user.user_id) {
        throw new Error('Invalid response data');
      }

      // Simpan token dan role dulu
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['userRole', role.toLowerCase().trim()],
      ]);

      // Set user data
      setUserData(user);
      setUserRole(role.toLowerCase().trim());
      
      // Ambil profil lengkap
      await getUserProfile(token);
      
      // Set login status terakhir
      setIsLoggedIn(true);

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
      
      // Hapus data auth dari storage
      await AsyncStorage.multiRemove(['authToken', 'userRole']);

      // Reset semua state
      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);

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
    setUserData,
    login,
    logout,
    checkAuthStatus,
  };

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

