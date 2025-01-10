import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import FloatingNotification from '../components/FloatingNotification';
import { useNavigation } from '@react-navigation/native';

const ProductScreen = () => {
  const navigation = useNavigation(); // Use navigation hook
  const { userData } = useAuth(); // Access user data from AuthContext
  const user_id = userData?.user_id; // Extract user ID from user data
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk menampilkan notifikasi
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://172.20.10.3:5000/api/all');
        const data = await response.json();
        const fetchedProducts = data.products.map(product => ({
          id: product.product_id.toString(),
          name: product.name,
          description: product.description || 'No description available',
          price: parseFloat(product.price),
          image: product.productPict ? product.productPict : null,
          category: product.category_id || 'Unknown', 
          stock: product.stock,
        }));
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const addToCart = async (product) => {
    if (!user_id) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    try {
      const payload = {
        user_id,
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
        setShowNotification(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const navigateToDetail = (item) => {
    navigation.navigate('ProductDetailScreen', { product: item });
  };

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
        onPress={() => navigateToDetail(item)}
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
              addToCart(item);
            }}
          >
            <Ionicons name="add" size={20} color="#ffffff" fontWeight="bold" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleHideNotification = () => {
    setShowNotification(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <FloatingNotification
        visible={showNotification}
        message="Produk berhasil ditambahkan ke keranjang!"
        onHide={handleHideNotification}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome5 name="search" size={20} color="#7a7a7a" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
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
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 10 : 10,
    marginTop: Platform.OS === 'android' ? 0 : 0,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  searchInput: {
    flex: 1,
    height: Platform.OS === 'android' ? 45 : 40,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: Platform.OS === 'android' ? 12 : 10,
    marginRight: Platform.OS === 'android' ? 8 : 10,
    fontSize: Platform.OS === 'android' ? 13 : 14,
  },
  iconButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    width: Platform.OS === 'android' ? 45 : 40,
    height: Platform.OS === 'android' ? 45 : 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 'auto', // Memastikan footer selalu di bawah
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default ProductScreen;
