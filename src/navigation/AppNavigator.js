// File: C:/Users/HP/PROJECT DPM/Petshop-App/src/navigation/AppNavigator.js
// src/navigation/AppNavigator.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomTabs from "../components/BottomTabs";
import AdminNavigations from './AdminNavigations';
import AuthNavigator from './AuthNavigator';
import { View, Text } from 'react-native';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);

const AppNavigator = () => {
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const [cart, setCart] = useState([]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIn) {
    return <AuthNavigator />;
  }

  if (userRole === 'admin') {
    return <AdminNavigations />;
  }

  return (
    <BottomTabs
      cart={cart}
      setCart={setCart}
    />
  );
};

export default AppNavigator;