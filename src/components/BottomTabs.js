// File: C:/Users/HP/PROJECT DPM/Petshop-App/src/components/BottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";

// Import Screens
import HomeScreen from "../screens/HomeScreen";
import PenitipanScreen from "../screens/PilihanPenitipanScreen";
import CartScreen from "../screens/CartScreen";
import ProfilePageScreen from "../screens/ProfilePageScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import ProductScreen from "../screens/ProductScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

const Tab = createBottomTabNavigator();

const BottomTabs = ({ cart, setCart, setIsLoggedIn }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Penitipan") {
            iconName = "dog";
          } else if (route.name === "ProductScreen") {
            iconName = "shopping-bag";
          } else if (route.name === "Profile") {
            iconName = "user";
          }
          return (
            <FontAwesome5
              name={iconName}
              size={size}
              color={focused ? "#FFFFFF" : "#7a7a7a"}
            />
          );
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#7a7a7a",
        tabBarStyle: {
          backgroundColor: "#C0EBA6",
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingTop: 15,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: "absolute",
          display: navigation.getState().routes.find(
            r => r.name === 'ScheduleScreen' || r.name === 'ProductDetailScreen'
          ) ? 'none' : 'flex'
        },
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => <HomeScreen cart={cart} setCart={setCart} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Penitipan"
        component={PenitipanScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        options={{ headerShown: false }}
      >
        {props => (
          <ProfilePageScreen 
            {...props} 
            setIsLoggedIn={setIsLoggedIn} 
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const HomeScreenStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen 
        name="ProductDetailScreen" 
        component={ProductDetailScreen}
        options={{
          tabBarStyle: { display: 'none' },
          presentation: 'modal'
        }}
      />
      <Stack.Screen name="CartScreen" component={CartScreen} />
    </Stack.Navigator>
  );
};

const PenitipanStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PenitipanScreen" component={PenitipanScreen} />
      <Stack.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{
          tabBarStyle: { display: 'none' },
        }}
      />
    </Stack.Navigator>
  );
};

export default BottomTabs;
