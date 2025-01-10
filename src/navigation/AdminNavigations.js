// AdminNavigations.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminBottomTabs from "../components/AdminBottomTabs";
import EditProduct from "../screens/EditProduct";

const Stack = createStackNavigator();

export default function AdminNavigations() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminBottomTabs" component={AdminBottomTabs} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
    </Stack.Navigator>
  );
}