// File: C:/Users/HP/PROJECT DPM/Petshop-App/src/navigation/AdminBottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Platform } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

import AdminDashboard from "../screens/AdminDashboard";
import AdminAdjustment from "../screens/AdminAdjustment";
import CrudPageScreen from "../screens/crudPageScreen";

const Tab = createBottomTabNavigator();

export default function AdminBottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused }) => {
          let icon;

          if (route.name === "Dashboard") {
            icon = (
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="home" 
                  size={28} 
                  color={focused ? "#FFFFFF" : "#9FD99F"} 
                  style={styles.icon}
                />
                {focused && <View style={styles.dot} />}
              </View>
            );
          } else if (route.name === "CrudPageScreen") {
            return (
              <View style={styles.addButtonContainer}>
                <View style={styles.addButtonOuter}>
                  <View style={styles.addButton}>
                    <FontAwesome5 
                      name="plus" 
                      size={22} 
                      color="#C0EBA6" 
                      style={styles.plusIcon}
                    />
                  </View>
                </View>
                <View style={styles.dot} />
              </View>
            );
          } else if (route.name === "Adjustment") {
            icon = (
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="bag" 
                  size={28} 
                  color={focused ? "#FFFFFF" : "#9FD99F"} 
                  style={styles.icon}
                />
                {focused && <View style={styles.dot} />}
              </View>
            );
          }

          return icon;
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#9FD99F",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#C0EBA6',
          height: Platform.OS === 'ios' ? 85 : 80,
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          display: navigation.getState().routes.find(r => r.name === 'Schedule') ? 'none' : 'flex'
        },
        tabBarLabel: () => null,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="CrudPageScreen" component={CrudPageScreen} />
      <Tab.Screen name="Adjustment" component={AdminAdjustment} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    height: 40,
  },
  icon: {
    marginBottom: 3,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: -15,
  },
  addButtonOuter: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  plusIcon: {
    opacity: 0.9,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  }
});
