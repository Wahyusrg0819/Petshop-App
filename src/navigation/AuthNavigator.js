import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PasswordResetProvider } from '../context/PasswordResetContext';
import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import OtpVerificationScreen from "../screens/OtpVerificationScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <PasswordResetProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' },
          presentation: 'card',
          animationEnabled: true,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
          },
        }}
        initialRouteName="LoginScreen"
      >
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ gestureEnabled: false }}
        />
        
        {/* Authentication Related Screens */}
        <Stack.Group>
          <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="OtpVerificationScreen" component={OtpVerificationScreen} />
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </PasswordResetProvider>
  );
};

export default AuthNavigator;
