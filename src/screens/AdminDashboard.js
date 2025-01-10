import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
  const { logout } = useAuth();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Pakan', count: 0 },
    { id: 2, name: 'Mainan', count: 0 },
    { id: 3, name: 'Accessories', count: 0 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Pakan');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const API_BASE_URL = 'http://172.20.10.3:5000';

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/all`);
      const data = await response.json();

      if (!data.products || !Array.isArray(data.products)) {
        console.error('API response does not contain products array:', data);
        Alert.alert('Error', 'Invalid data format from API');
        return;
      }

      // Debug log untuk melihat data produk
      console.log('Fetched products:', data.products);

      const newCategories = categories.map(category => ({
        ...category,
        count: data.products.filter(product => product.category_id === category.id).length
      }));

      setCategories(newCategories);
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        return;
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Fungsi pencarian produk
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi untuk mengecek notifikasi yang belum dibaca
  const checkUnreadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin`);
      const data = await response.json();

      if (response.ok) {
        // Hitung jumlah notifikasi yang belum dibaca
        const unreadCount = data.filter(notification => !notification.is_read).length;
        setUnreadNotifications(unreadCount);
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
  }, [navigation]);

  const renderProductCard = (product) => {
    // Debug log untuk melihat path gambar
    console.log('Product image path:', product.productPict);
    console.log('Full image URL:', `${product.productPict}`);

    return (
      <TouchableOpacity 
        key={product.product_id} 
        style={styles.productCard}
        onPress={() => {
          // Tambahkan navigasi ke detail produk jika diperlukan
          console.log('Product pressed:', product.name);
        }}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={product.productPict ? { uri: product.productPict } : require('../../assets/images/no-image.png')}
            style={styles.productImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('Error loading image:', error.nativeEvent.error);
            }}
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description || 'No description available'}
          </Text>
          <Text style={styles.productPrice}>
            Rp {parseFloat(product.price).toLocaleString('id-ID')}
          </Text>
          <Text style={[
            styles.productStock,
            product.stock <= 0 ? styles.outOfStock : null
          ]}>
            Stock: {product.stock}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Update bagian render notifikasi button
  const renderNotificationButton = () => (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => navigation.navigate('AdminNotificationScreen')}
    >
      <View>
        <Ionicons name="notifications-outline" size={24} color="#333" />
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
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          {renderNotificationButton()}
          <TouchableOpacity 
            style={styles.orderButton}
            onPress={() => navigation.navigate('AdminOrderListScreen')}
          >
            <Ionicons name="list" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#C0EBA6']}
            tintColor="#C0EBA6"
          />
        }
        style={styles.scrollView}
      >
        <View style={styles.mainContent}>
          <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category.name && styles.activeCategoryPill
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      selectedCategory === category.name && styles.activeCategoryPillText
                    ]}
                  >
                    {category.name.toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.stockSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Stock Produk</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#C0EBA6" />
                <Text style={styles.loadingText}>Memuat produk...</Text>
              </View>
            ) : (
              <View style={styles.productList}>
                {filteredProducts
                  .filter(product => {
                    const categoryName = categories.find(c => c.id === product.category_id)?.name;
                    return categoryName === selectedCategory;
                  })
                  .map(renderProductCard)}
                {filteredProducts.length === 0 && !isLoading && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Tidak ada produk tersedia.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button untuk Penitipan */}
      <TouchableOpacity 
        style={styles.fabPenitipan}
        onPress={() => navigation.navigate('AdminPetBoarding')}
      >
        <View style={styles.fabContent}>
          <Ionicons name="paw" size={24} color="#FFFFFF" />
          <Text style={styles.fabText}>Penitipan</Text>
        </View>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  headerLeft: {
    width: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
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
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  stockSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#C0EBA6',
    fontWeight: '500',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  activeCategoryPill: {
    backgroundColor: '#C0EBA6',
  },
  categoryPillText: {
    fontSize: 16,
    color: '#666',
    textTransform: 'lowercase',
  },
  activeCategoryPillText: {
    color: '#FFF',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomBarButton: {
    padding: 8,
  },
  addProductButton: {
    backgroundColor: '#C0EBA6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  outOfStock: {
    color: '#dc3545',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  orderButton: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginRight: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fabPenitipan: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    backgroundColor: '#C0EBA6',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminDashboard;