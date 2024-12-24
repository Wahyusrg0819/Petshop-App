// src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Import screens
import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import AdminDashboard from '../screens/AdminDashboard';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductScreen from '../screens/ProductScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { isLoading, isLoggedIn, userRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        presentation: 'card',
        animationEnabled: true,
        // Add transition configuration
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
      }}
      // Set initial route based on auth state
      initialRouteName={isLoggedIn ? (userRole === 'admin' ? 'AdminDashboard' : 'HomeScreen') : 'LoginScreen'}
    >
      {/* Auth Flow Screens */}
      <Stack.Screen 
        name="LoginScreen" 
        component={LoginScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="CreateAccountScreen" 
        component={CreateAccountScreen}
        options={{
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />

      {/* Password Reset Flow Screens */}
      <Stack.Screen 
        name="ForgotPasswordScreen" 
        component={ForgotPasswordScreen}
        options={{
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateY: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0],
                  }),
                },
              ],
            },
          }),
        }}
      />
      <Stack.Screen
        name="OtpVerificationScreen"
        component={OtpVerificationScreen}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />
      <Stack.Screen 
        name="ResetPasswordScreen" 
        component={ResetPasswordScreen}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />

      {/* App Main Screens */}
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />
      <Stack.Screen 
        name="ProductScreen" 
        component={ProductScreen} 
      />
      <Stack.Screen 
        name="ProductDetailScreen" 
        component={ProductDetailScreen} 
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      />
    </Stack.Navigator>
  );

  

};

export default AuthNavigator;