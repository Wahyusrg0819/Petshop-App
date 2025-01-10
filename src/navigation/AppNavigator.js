import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigations';
import AdminNotificationScreen from '../screens/AdminNotificationScreen';
import AdminOrderListScreen from '../screens/AdminOrderListScreen';
import AdminPetBoardingScreen from '../screens/AdminPetBoardingScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, isLoading, userRole } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator>
      {userRole === 'admin' ? (
        <>
          <Stack.Screen 
            name="AdminMain" 
            component={AdminNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminNotificationScreen" 
            component={AdminNotificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminOrderListScreen" 
            component={AdminOrderListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminPetBoarding" 
            component={AdminPetBoardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="BookingDetail" 
            component={BookingDetailScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
