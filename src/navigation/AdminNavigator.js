import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../screens/AdminDashboard';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

const AdminNavigator = () => {
  const { userRole, checkSession } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const validateSession = async () => {
      const isSessionValid = await checkSession();
      if (!isSessionValid || userRole !== 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      }
    };

    validateSession();
    
    // Optional: Periodic session check
    const sessionCheckInterval = setInterval(validateSession, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(sessionCheckInterval);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      {/* Tambahkan screen admin lainnya di sini */}
    </Stack.Navigator>
  );
};

export default AdminNavigator; 