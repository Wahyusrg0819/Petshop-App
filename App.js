import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';


const Stack = createStackNavigator();

const AppContent = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const [cart, setCart] = useState([]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Tampilkan navigasi berdasarkan status login
  return isLoggedIn ? <AppNavigator cart={cart} setCart={setCart} /> : <AuthNavigator />;
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}
