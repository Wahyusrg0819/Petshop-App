import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from '../components/BottomTabs';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SettingsPage from '../screens/SettingsPage';
import EditAccountPage from '../screens/EditAccountPage';
import PrivacyPage from '../screens/Privacypage';
import FAQPageScreen from '../screens/FAQPageScreen';
import CartScreen from '../screens/CartScreen';
import KeamananPage from '../screens/KeamananPage';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import ProfilePageScreen from '../screens/ProfilePageScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChangeEmailScreen from '../screens/ChangeEmailScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="ProfilePageScreen" component={ProfilePageScreen} />
      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
      />
      
      {/* Settings Related Screens */}
      <Stack.Group>
        <Stack.Screen name="SettingsPage" component={SettingsPage} />
        <Stack.Screen name="EditAccountPage" component={EditAccountPage} />
        <Stack.Screen name="PrivacyPage" component={PrivacyPage} />
        <Stack.Screen name="FAQPageScreen" component={FAQPageScreen} />
        <Stack.Screen name="KeamananPage" component={KeamananPage} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="ChangeEmailScreen" component={ChangeEmailScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      </Stack.Group>

      {/* Shopping & Services Related Screens */}
      <Stack.Group>
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Group>

      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen 
        name="BookingSuccess" 
        component={BookingSuccessScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="MyOrders" 
        component={MyOrdersScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 