import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ title, onBackPress, onSearchPress, onNotificationPress }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top }
    ]}>
      {onBackPress ? (
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightIcons}>
        {onSearchPress && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <FontAwesome5 name="search" size={20} color="#7a7a7a" />
          </TouchableOpacity>
        )}
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <FontAwesome5 name="bell" size={20} color="#7a7a7a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const ProductDetailHeader = ({ onBackPress, onFavoritePress, isFavorite, scrollY }) => {
  const insets = useSafeAreaInsets();
  const opacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0.9],
    extrapolate: 'clamp'
  });

  return (
    <View style={[
      styles.headerContainer,
      { 
        height: Platform.OS === 'ios' ? 44 + insets.top : 56,
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        top: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
      }
    ]}>
      <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.headerOverlay, { opacity }]} />
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
        >  
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Detail Produk</Text>  
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onFavoritePress}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={24} 
            color={isFavorite ? "#ff0000" : "#333"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },

  headerContainer: { 
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 44 : 56,
    zIndex: 1,
  },
  backButton: { 
    padding: 8,
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  favoriteButton: { 
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: { 
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Header;
