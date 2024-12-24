import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

const PasswordResetContext = createContext(null);

export const PasswordResetProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to request OTP for password reset
  const requestPasswordReset = async (email) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://172.20.10.2:5000/api/forgot-password',
        { email }
      );

      // Return success without showing Alert
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to send OTP'
      );
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to verify OTP
  const verifyOTP = async (email, otp) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://172.20.10.2:5000/api/verify-otp',
        { email, otp }
      );

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to verify OTP'
      );
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset password using OTP
  const resetPasswordWithOTP = async (email, otp, newPassword) => {
    try {
      setIsLoading(true);
  
      console.log('Data yang dikirim ke API reset-password:', { email, otp, newPassword });
  
      const response = await axios.post(
        'http://172.20.10.2:5000/api/reset-password',
        { email, otp, newPassword }
      );
  
      console.log('Respons dari server:', response.data);
  
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error dari API reset-password:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to reset password',
      };
    } finally {
      setIsLoading(false);
    }
  };
  

  const passwordResetContext = {
    isLoading,
    requestPasswordReset,
    verifyOTP, // Tambahkan fungsi verifyOTP ke context
    resetPasswordWithOTP,
  };

  return (
    <PasswordResetContext.Provider value={passwordResetContext}>
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => {
  const context = useContext(PasswordResetContext);
  if (!context) {
    throw new Error('usePasswordReset must be used within a PasswordResetProvider');
  }
  return context;
};

export default PasswordResetContext;
