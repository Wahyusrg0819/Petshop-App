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
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
  const { logout } = useAuth();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Pakan', count: 0 },
    { id: 2, name: 'Mainan', count: 0 },
    { id: 3, name: 'Accessories', count: 0 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('Pakan');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = 'http://172.20.10.2:5000';

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

  useEffect(() => {
    fetchProducts();
  }, []);

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
            source={
              product.productPict 
                ? { uri: `${product.productPict}` }
                : require('../../assets/images/default-avatar-image.png')
            }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.activeCategoryText
                  ]}
                >
                  {category.name}
                </Text>
                <Text style={styles.categoryCount}>{category.count} items</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Products</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#C0EBA6" style={styles.loader} />
          ) : (
            <View style={styles.productList}>
              {products
                .filter(product => {
                  const categoryName = categories.find(c => c.id === product.category_id)?.name;
                  return categoryName === selectedCategory;
                })
                .map(renderProductCard)}
              {products.length === 0 && !isLoading && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No products available.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8EB92',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: '#9FEF9D',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  productCard: {
    flexBasis: '48%',
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
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
  }
});

export default AdminDashboard;