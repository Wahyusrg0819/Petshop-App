import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import ModalScreen from './ModalScreen';
import ModalScreenAndroid from './ModalScreenAndroid';
import { useAuth } from '../context/AuthContext';
import PromoCarousel from '../components/PromoCarousel';

// 1) Import AddToCartModal di sini
import FloatingNotification from '../components/FloatingNotification';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

const INITIAL_NUM_PRODUCTS = 6;
const LOAD_MORE_NUM_PRODUCTS = 6;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth(); // Akses userData
  const user_id = userData?.user_id; // Ambil user_id dari userData
  const address = userData?.address

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Pakan');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationName, setLocationName] = useState(address || 'Fetching location...');
  
  // State untuk pagination
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [numProducts, setNumProducts] = useState(INITIAL_NUM_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // 2) State untuk menampilkan modal add-to-cart
  const [showNotification, setShowNotification] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const ModalComponent = Platform.OS === 'android' ? ModalScreenAndroid : ModalScreen;

  useEffect(() => {
    const fetchCategoryAndProductData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://172.20.10.3:5000/api/all');
        const data = await response.json();

        if (!data.products || !Array.isArray(data.products)) {
          console.error('API response does not contain products array:', data);
          return;
        }

        const fetchedCategories = [
          { id: '1', name: 'Pakan', isActive: true },
          { id: '2', name: 'Mainan', isActive: false },
          { id: '3', name: 'Accessories', isActive: false },
        ];

        const fetchedProducts = data.products.map(product => ({
          id: product.product_id.toString(),
          name: product.name,
          description: product.description || 'No description available',
          price: parseFloat(product.price),
          image: product.productPict ? product.productPict : null,
          category: fetchedCategories.find(cat => cat.id === product.category_id.toString())?.name || 'Unknown',
          stock: product.stock,
        }));

        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
        loadProducts(fetchedProducts, fetchedCategories[0]?.name || '');
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndProductData();
  }, []);

  const loadProducts = (allProducts = products, category = selectedCategory) => {
    const filtered = allProducts
      .filter((product) => product.category === category)
      .slice(0, numProducts);
    setVisibleProducts(filtered);
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, numProducts]);

  const handleLoadMore = () => {
    if (isLoading) return;

    const filtered = products.filter((product) => product.category === selectedCategory);
    if (numProducts >= filtered.length) return;

    setIsLoading(true);
    setTimeout(() => {
      setNumProducts((prev) => prev + LOAD_MORE_NUM_PRODUCTS);
      setIsLoading(false);
    }, 1000);
  };

  // 3) Ubah fungsi addToCart agar menampilkan modal jika sukses
  const addToCart = async (product, userId) => {
    try {
      const payload = {
        user_id: userId,
        product_id: product.id,
        productPict: product.image,
        quantity: 1,
        price: product.price,
      };

      console.log('Payload:', payload);

      const response = await fetch('http://172.20.10.3:5000/api/addcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setShowNotification(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Tambahkan fungsi untuk menutup notifikasi
  const handleHideNotification = () => {
    setShowNotification(false);
  };

  const handleCategoryPress = (categoryName) => {
    setSelectedCategory(categoryName);
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.name === categoryName
          ? { ...category, isActive: true }
          : { ...category, isActive: false }
      )
    );
    setNumProducts(INITIAL_NUM_PRODUCTS);
  };

  const handleAddToCart = (product) => {
    if (!user_id) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }
    addToCart(product, user_id);
  };

  const renderCategory = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.categoryButton, item.isActive && styles.activeCategoryButton]}
      onPress={() => handleCategoryPress(item.name)}
    >
      <Text style={[styles.categoryText, item.isActive && styles.activeCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );


  const renderProduct = ({ item }) => {
    const formattedPrice = item.price.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => 
          navigation.navigate('ProductDetailScreen', { product: item })
        }
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
              e.stopPropagation();
              handleAddToCart(item);
            }}
          >
            <Ionicons name="add" size={20} color="#ffffff" fontWeight="bold" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#8bc34a" />
      </View>
    );
  };

  // Fungsi untuk mengecek notifikasi yang belum dibaca
  const checkUnreadNotifications = async () => {
    try {
      // Jika user login, cek notifikasi user
      if (userData?.user_id) {
        const response = await fetch(`${API_BASE_URL}/api/notifications/user/${userData.user_id}`);
        const data = await response.json();

        if (response.ok) {
          // Hitung notifikasi yang belum dibaca
          const unreadCount = data.filter(notification => !notification.is_read).length;
          setUnreadNotifications(unreadCount);
        }
      } else {
        // Jika tidak login, cek notifikasi umum (tipe promo)
        const response = await fetch(`${API_BASE_URL}/api/notifications/public`);
        const data = await response.json();

        if (response.ok) {
          // Hitung notifikasi promo yang belum dibaca
          const unreadCount = data.filter(notification => 
            !notification.is_read && notification.type === 'promo'
          ).length;
          setUnreadNotifications(unreadCount);
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  useEffect(() => {
    // Cek notifikasi saat komponen dimount
    checkUnreadNotifications();

    // Set interval untuk mengecek notifikasi setiap 30 detik
    const intervalId = setInterval(checkUnreadNotifications, 30000);

    // Cek notifikasi setiap kali screen mendapat fokus
    const unsubscribeFocus = navigation.addListener('focus', () => {
      checkUnreadNotifications();
    });

    // Cleanup interval dan listener saat komponen unmount
    return () => {
      clearInterval(intervalId);
      unsubscribeFocus();
    };
  }, [navigation, userData]);

  // Render icon notifikasi dengan badge
  const renderNotificationIcon = () => (
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={() => navigation.navigate('NotificationScreen')}
    >
      <View>
        <FontAwesome5 name="bell" size={20} color="#7a7a7a" />
        {unreadNotifications > 0 && (
          <View style={styles.notificationBadge}>
            {unreadNotifications > 99 ? (
              <Text style={styles.badgeText}>99+</Text>
            ) : (
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <FloatingNotification
        visible={showNotification}
        message="Produk berhasil ditambahkan ke keranjang!"
        onHide={handleHideNotification}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <FlatList
            data={visibleProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={
              <>
                <View style={styles.header}>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('Location button pressed');
                      setIsLocationModalVisible(true);
                    }}
                  >
                    <Text style={styles.locationLabel}>Location</Text>
                    <Text style={styles.locationValue}>
                      {locationName.length > 25
                        ? `${locationName.slice(0, 25)}...`
                        : locationName}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.headerIcons}>
                    {renderNotificationIcon()}
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => navigation.navigate('CartScreen')}
                    >
                      <Ionicons name="cart" size={20} color="#7a7a7a" />
                    </TouchableOpacity>
                  </View>
                </View>

                <PromoCarousel />

                <View style={styles.categorySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Category</Text>
                  </View>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    renderItem={({ item }) => renderCategory(item)}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.categoriesContainer}
                  />
                </View>

                <View style={styles.productSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle2}>Product</Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ProductScreen", { products })
                      }
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            }
            ListFooterComponent={renderFooter}
          />
        </View>
      </SafeAreaView>
      
      {isLocationModalVisible && (
        <ModalComponent
          isVisible={isLocationModalVisible}
          onClose={() => {
            console.log('Closing modal');
            setIsLocationModalVisible(false);
          }}
          location={location}
          errorMsg={errorMsg}
          setLocationName={setLocationName}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 10,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  locationLabel: {
    fontSize: 12,
    color: '#7a7a7a',
  },
  locationValue: {
    fontSize: Platform.OS === 'android' ? 14 : 16,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'android' ? 8 : 10,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    width: Platform.OS === 'android' ? 35 : 40,
    height: Platform.OS === 'android' ? 35 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 8 : 10,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: 'bold',
  },
  sectionTitle2: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'android' ? 8 : 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: Platform.OS === 'android' ? 8 : 10,
    paddingVertical: Platform.OS === 'android' ? 4 : 0,
  },
  categoryButton: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: Platform.OS === 'android' ? 12 : 15,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#8bc34a',
  },
  categoryText: {
    fontSize: Platform.OS === 'android' ? 13 : 14,
    color: '#7a7a7a',
  },
  activeCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'android' ? 16 : 20,
  },
  productCard: {
    width: '48%',
    height: Platform.OS === 'android' ? 200 : 220,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: Platform.OS === 'android' ? 12 : 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  productImage: {
    width: Platform.OS === 'android' ? 90 : 100,
    height: Platform.OS === 'android' ? 90 : 100,
    resizeMode: 'contain',
    marginBottom: Platform.OS === 'android' ? 6 : 8,
    alignSelf: 'center',
  },
  productName: {
    fontSize: Platform.OS === 'android' ? 13 : 14,
    width: '100%',
    minHeight: Platform.OS === 'android' ? 35 : 40,
    maxHeight: Platform.OS === 'android' ? 35 : 40,
    overflow: 'hidden',
  },
  productDescription: {
    fontSize: Platform.OS === 'android' ? 11 : 12,
    width: '100%',
    height: Platform.OS === 'android' ? 25 : 30,
    overflow: 'hidden',
    color: '#666',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Platform.OS === 'android' ? 6 : 8,
  },
  productPrice: {
    fontSize: Platform.OS === 'android' ? 14 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#C0EBA6',
    width: Platform.OS === 'android' ? 28 : 30,
    height: Platform.OS === 'android' ? 28 : 30,
    borderRadius: Platform.OS === 'android' ? 14 : 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productSection: {
    marginBottom: Platform.OS === 'android' ? 8 : 10,
  },
  footer: {
    paddingVertical: Platform.OS === 'android' ? 16 : 20,
  },
  viewAllText: {
    color: '#8bc34a',
    fontSize: Platform.OS === 'android' ? 13 : 14,
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
