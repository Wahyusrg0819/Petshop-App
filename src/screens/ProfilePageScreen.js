// src/screens/ProfilePageScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Fungsi untuk menghasilkan warna random berdasarkan seed
const generateRandomColor = (seed) => {
  // Menggunakan seed untuk menghasilkan angka random yang konsisten
  const randomNum = Math.abs(Math.sin(seed) * 16777215);
  // Konversi ke format hex color
  const color = '#' + Math.floor(randomNum).toString(16).padStart(6, '0');
  return color;
};

// Fungsi untuk menghasilkan gradien warna berdasarkan userId
const getGradientColors = (userId) => {
  if (!userId) {
    // Warna default untuk guest
    return ['#C0EBA6', '#86D377'];
  }

  // Menggunakan userId sebagai seed untuk menghasilkan dua warna yang berbeda
  const seed1 = userId.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * i, 0);
  const seed2 = seed1 + 12345; // Offset untuk warna kedua

  return [generateRandomColor(seed1), generateRandomColor(seed2)];
};

const ProfilePageScreen = ({ navigation }) => {
  const { userData, logout, updateProfilePicture, getUserProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get gradient colors based on user ID
  const bannerGradient = getGradientColors(userData?.id);

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const success = await updateProfilePicture(result.assets[0].uri);
        if (success) {
          Alert.alert('Success', 'Profile picture updated successfully');
        }
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserProfile();
    } finally {
      setRefreshing(false);
    }
  }, [getUserProfile]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[bannerGradient[0]]}
            tintColor={bannerGradient[0]}
          />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.bannerBackground}>
            <LinearGradient
              colors={bannerGradient}
              style={styles.bannerPattern}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              locations={[0, 1]}
            />
          </View>
          
          <TouchableOpacity style={styles.avatarContainer} onPress={selectImage}>
            <Image
              source={userData?.profilePicture ? { uri: userData.profilePicture } : null}
              style={styles.avatarImage}
            />
            {!userData?.profilePicture && (
              <View style={[styles.avatarImage, styles.defaultAvatar]}>
                <FontAwesome5 name="user-alt" size={40} color="#666666" />
              </View>
            )}
            <View style={styles.plusIconContainer}>
              <FontAwesome5 name="plus-circle" size={25} color={bannerGradient[0]} solid />
            </View>
          </TouchableOpacity>

          <Text style={styles.username}>{userData?.name || 'Guest User'}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.savedButton, { backgroundColor: bannerGradient[0] }]}
            >
              <Text style={styles.buttonText}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productsGrid}>
          <View style={styles.productCard}>
            <Image 
              source={require('../../assets/images/rc-kitten.png')}
              style={styles.productImage}
            />
            <Text style={styles.productName}>RC Kitten</Text>
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>$20,99</Text>
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: bannerGradient[0] }]}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#FF6B6B' }]} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    alignItems: 'center',
  },
  bannerBackground: {
    width: '90%',
    height: 150,
    overflow: 'hidden',
    borderRadius: 15,
  },
  bannerPattern: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    marginTop: -50,
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEEEEE',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  savedButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  editButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  editButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
    marginTop: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 2,
  },
});

export default ProfilePageScreen;