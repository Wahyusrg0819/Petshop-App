import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Fungsi untuk menghasilkan warna random berdasarkan seed
const generateRandomColor = (seed) => {
  const randomNum = Math.abs(Math.sin(seed) * 16777215);
  const color = '#' + Math.floor(randomNum).toString(16).padStart(6, '0');
  return color;
};

// Fungsi untuk menghasilkan gradien warna berdasarkan nama pengguna atau email
const getGradientColors = (userIdentifier) => {
  if (!userIdentifier) {
    return ['#C0EBA6', '#86D377'];
  }
  const seed1 = userIdentifier.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * i, 0);
  const seed2 = seed1 + 12345;
  return [generateRandomColor(seed1), generateRandomColor(seed2)];
};

const ProfilePageScreen = ({ navigation }) => {
  const { userData, checkAuthStatus, setUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [bannerGradient, setBannerGradient] = useState(['#C0EBA6', '#86D377']);
  const [savedProducts, setSavedProducts] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showSaved, setShowSaved] = useState(true);

  useEffect(() => {
    if (userData) {
      setBannerGradient(getGradientColors(userData.name || userData.email));
      fetchSavedProducts();
    }
  }, [userData]);

  const fetchSavedProducts = async () => {
    if (!userData?.user_id) return;
    
    setIsLoadingSaved(true);
    try {
      // 1. Fetch favorite product IDs
      const favResponse = await axios.get(`http://172.20.10.3:5000/api/favorites/${userData.user_id}`);
      
      // Jika tidak ada data favorit, set array kosong
      if (!favResponse.data || favResponse.status === 404) {
        setSavedProducts([]);
        setIsLoadingSaved(false);
        return;
      }

      // 2. Fetch detailed product information for each favorite
      const productPromises = favResponse.data.map(async (fav) => {
        try {
          const productResponse = await axios.get(`http://172.20.10.3:5000/api/getproduct/${fav.product_id}`);
          // Mengakses data produk yang berada di dalam properti 'product'
          const productData = productResponse.data.product;
          
          if (!productData) {
            console.log('Invalid product data:', productResponse.data);
            return null;
          }

          return {
            id: productData.product_id,
            product_id: productData.product_id,
            name: productData.name || 'Unnamed Product',
            description: productData.description || 'No description available',
            price: productData.price ? parseFloat(productData.price) : 0,
            image: productData.productPict || null,
            category: productData.category_id || 'Unknown',
            stock: productData.stock || 0,
          };
        } catch (error) {
          console.log(`Skipping product ${fav.product_id}:`, error.message);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      // Filter out any failed product fetches
      const validProducts = products.filter(product => product !== null);
      setSavedProducts(validProducts);
    } catch (error) {
      // Jika error 404, berarti tidak ada favorit
      if (error.response?.status === 404) {
        setSavedProducts([]);
      } else {
        console.log('Error fetching saved products:', error.message);
      }
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), fetchSavedProducts()]);
    } finally {
      setRefreshing(false);
    }
  }, [setUserData]);

  const handleRemoveFavorite = async (productId) => {
    if (!userData?.user_id) return;

    try {
      const response = await axios.delete(`http://172.20.10.3:5000/api/favorites/removeFavorite`, {
        data: {
          user_id: userData.user_id,
          product_id: productId
        }
      });

      if (response.data) {
        // Hapus produk dari state lokal
        setSavedProducts(prev => prev.filter(product => product.product_id !== productId));
        Alert.alert('Sukses', 'Produk berhasil dihapus dari favorit');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Gagal menghapus produk dari favorit');
    }
  };

  const renderProductItem = ({ item }) => {
    const formattedPrice = item.price.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}
      >
        <Image 
          source={item.image ? { uri: item.image } : require('../../assets/images/no-image.png')} 
          style={styles.productImage}
        />
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{formattedPrice}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent navigation
              handleAddToCart(item);
            }}
          >
            <Ionicons name="add" size={20} color="#ffffff" fontWeight="bold" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = async (product) => {
    if (!userData?.user_id) {
      Alert.alert('Error', 'Silakan login terlebih dahulu');
      return;
    }

    try {
      const payload = {
        user_id: userData.user_id,
        product_id: product.id,
        productPict: product.image,
        quantity: 1,
        price: product.price,
      };

      const response = await fetch('http://172.20.10.3:5000/api/addcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukses', 'Produk berhasil ditambahkan ke keranjang');
      } else {
        Alert.alert('Error', data.message || 'Gagal menambahkan produk ke keranjang');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const refreshProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get('http://172.20.10.3:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.user) {
        const profile = response.data.user;
        setUserData({
          user_id: profile.userId,
          email: profile.email,
          phone: profile.phone || '',
          username: profile.username || '',
          name: profile.name || '',
          profilePicture: profile.profilePicture || null,
          recipientName: profile.recipientName || '',
          notes: profile.notes || '',
          address: profile.address || '',
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil');
    }
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('SettingsPage')}
          >
            <Ionicons name="settings-outline" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

            <View style={styles.avatarContainer}>
              <Image
                source={userData?.profilePicture ? { uri: userData.profilePicture } : null}
                style={styles.avatarImage}
              />
              {!userData?.profilePicture && (
                <View style={[styles.avatarImage, styles.defaultAvatar]}>
                  <FontAwesome5 name="user-alt" size={40} color="#666666" />
                </View>
              )}
            </View>

            <Text style={styles.username}>{userData?.name || 'Guest User'}</Text>
            <Text style={styles.userHandle}>@{userData?.username || 'username'}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.savedButton, { backgroundColor: bannerGradient[0] }]}
                onPress={() => setShowSaved(!showSaved)}
              >
                <Text style={styles.buttonText}>Saved ({savedProducts.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('EditAccountPage')}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showSaved && (
            <View style={styles.savedProductsSection}>
              {isLoadingSaved ? (
                <ActivityIndicator size="large" color={bannerGradient[0]} />
              ) : savedProducts.length > 0 ? (
                <FlatList
                  data={savedProducts}
                  renderItem={renderProductItem}
                  keyExtractor={(item) => item.product_id?.toString() || Math.random().toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.productGrid}
                />
              ) : (
                <Text style={styles.noProductsText}>Belum ada produk tersimpan</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 20,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  headerTitle: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
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
    width: '100%',
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
  userHandle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#C0EBA6',
    borderRadius: 8,
  },
  retryText: {
    color: '#000000',
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  savedProductsSection: {
    marginTop: 10,
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  productGrid: {
    gap: 10,
  },
  productCard: {
    width: '48%',
    height: 220,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
    margin: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
    alignSelf: 'center',
  },
  productName: {
    fontSize: 14,
    width: '100%',
    minHeight: 40,
    maxHeight: 40,
    overflow: 'hidden',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#C0EBA6',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 20,
  },
  removeButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
});

export default ProfilePageScreen;
