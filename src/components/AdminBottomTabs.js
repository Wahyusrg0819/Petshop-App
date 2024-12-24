// File: C:/Users/HP/PROJECT DPM/Petshop-App/src/navigation/AdminBottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";

import AdminDashboard from "../screens/AdminDashboard";
import AdminAdjustment from "../screens/AdminAdjustment";
import CrudPageScreen from "../screens/crudPageScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

const Tab = createBottomTabNavigator();

export default function AdminBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = "home";
          } else if (route.name === "CrudPageScreen") {
            iconName = "plus";
          } else if (route.name === "Adjustment") {
            iconName = "edit";
          } 

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#C0EBA6",
          elevation: 55,
          height: 70,
          paddingTop: 10,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: "absolute",
        },
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="CrudPageScreen" component={CrudPageScreen} />
      <Tab.Screen name="Adjustment" component={AdminAdjustment} />
      <Tab.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
      
    </Tab.Navigator>
  );
}
