// File: C:/Users/HP/PROJECT DPM/Petshop-App/src/components/BottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";

// Import Screens
import HomeScreen from "../screens/HomeScreen";
import PenitipanScreen from "../screens/PilihanPenitipanScreen";
import CartScreen from "../screens/CartScreen";
import ProfilePageScreen from "../screens/ProfilePageScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import ProductScreen from "../screens/ProductScreen";

const Tab = createBottomTabNavigator();

const BottomTabs = ({ cart, setCart, setIsLoggedIn }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
          height: 70,
          paddingTop: 15,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: "absolute",
        },
        tabBarLabel: () => null, // This hides the label (page name) under the icon
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => <HomeScreenStack cart={cart} setCart={setCart} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Penitipan"
        children={() => <PenitipanStack />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="ProductScreen"
        children={() => <ProductScreen />}
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

const HomeScreenStack = ({ cart, setCart }) => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen">
        {(props) => <HomeScreen {...props} cart={cart} setCart={setCart} />}
      </Stack.Screen>
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
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
