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
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ModalScreen from './ModalScreen';
import { useAuth } from '../context/AuthContext';




const INITIAL_NUM_PRODUCTS = 6;
const LOAD_MORE_NUM_PRODUCTS = 6;

const HomeScreen = ({ navigation, }) => {
  const { userData } = useAuth(); // Akses userData
  const  user_id = userData?.user_id; // Ambil user_id dari userData
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); // Mengakses cart dan addToCart dari CartContext
  const [selectedCategory, setSelectedCategory] = useState('Pakan');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationName, setLocationName] = useState('Fetching location...');
  
  // State untuk pagination
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [numProducts, setNumProducts] = useState(INITIAL_NUM_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  
  

  useEffect(() => {
    const fetchCategoryAndProductData = async () => {
      try {
        // Memulai loading
        setIsLoading(true);
  
        // Ambil data produk dari API
        const response = await fetch('http://172.20.10.2:5000/api/all');
        const data = await response.json();
  
        if (!data.products || !Array.isArray(data.products)) {
          console.error('API response does not contain products array:', data);
          return;
        }
  
        // Definisikan kategori secara manual
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
          image: product.productPict || '../../assets/images/default-avatar-image.png',
          category: fetchedCategories.find(cat => cat.id === product.category_id.toString())?.name || 'Unknown',
          stock: product.stock,
        }));
  
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
  
        // Load produk awal berdasarkan kategori aktif
        loadProducts(fetchedProducts, fetchedCategories[0]?.name || '');
  
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        // Selesai loading
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
    // Load ulang produk saat kategori atau jumlah produk berubah
    loadProducts();
  }, [selectedCategory, numProducts]);
  
  const handleLoadMore = () => {
    if (isLoading) return;
  
    const filtered = products.filter((product) => product.category === selectedCategory);
    if (numProducts >= filtered.length) return;
  
    setIsLoading(true);
  
    // Simulasi loading tambahan
    setTimeout(() => {
      setNumProducts((prev) => prev + LOAD_MORE_NUM_PRODUCTS);
      setIsLoading(false);
    }, 1000); // Waktu delay dipersingkat
  };

  const addToCart = async (product, userId) => {
    try {
      const payload = {
        user_id: userId,
        product_id: product.id,
        productPict: product.image, // Menambahkan gambar produk
        quantity: 1, // Default quantity
        price: product.price, // Harga produk
      };
  
      console.log('Payload:', payload); // Debugging
  
      const response = await fetch('http://172.20.10.2:5000/api/addcart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert('Success', 'Product added to cart!');
      } else {
        Alert.alert('Error', data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  

  const fetchUserLocation = async () => {
    try {
      // Minta izin lokasi
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLocationName('Permission denied');
        return;
      }
  
      // Ambil lokasi saat ini dengan timeout
      const currentLocation = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 5000) // Timeout setelah 5 detik
        ),
      ]);
  
      setLocation(currentLocation);
  
      // Perbarui lokasi awal sebagai koordinat kasar
      const { latitude, longitude } = currentLocation.coords;
      setLocationName(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
  
      // Jalankan reverse geocoding secara paralel
      (async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            setLocationName(
              data.address.village ||
                data.address.town ||
                data.address.city ||
                'Unknown location'
            );
          } else {
            setLocationName('Unknown location');
          }
        } catch (error) {
          console.error('Error during reverse geocoding:', error);
          setLocationName('Error fetching location name');
        }
      })();
    } catch (error) {
      console.error('Error fetching user location:', error);
      setLocationName('Error fetching location');
    }
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
    // Reset jumlah produk saat kategori berubah
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
    // Format harga dengan simbol Rp
    const formattedPrice = parseFloat(item.price).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });
  
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => 
          
          navigation.navigate('ProductDetailScreen', { product: item })}

      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productFooter}>
          {/* Tampilkan harga yang sudah diformat */}
          <Text style={styles.productPrice}>{formattedPrice}</Text>
  
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation(); // Menghindari navigasi
              handleAddToCart(item); // Memanggil fungsi untuk menambahkan ke cart
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
        <TouchableOpacity onPress={() => setIsLocationModalVisible(true)}>
          <Text style={styles.locationLabel}>Location</Text>
          <Text style={styles.locationValue}>{locationName}</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="search" size={20} color="#7a7a7a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome5 name="bell" size={20} color="#7a7a7a" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('CartScreen')}
          >
            <Ionicons name="cart" size={20} color="#7a7a7a" />
          </TouchableOpacity>

        </View>
      </View>

              <View style={styles.promoCard}>
                <Text style={styles.promoTitle}>Royal Canin Adult Pomeranian</Text>
                <Text style={styles.promoDescription}>
                  Get an interesting promo here, without conditions
                </Text>
              </View>

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

        <ModalScreen
          isVisible={isLocationModalVisible}
          onClose={() => setIsLocationModalVisible(false)}
          fetchUserLocation={fetchUserLocation}
          location={location}
          errorMsg={errorMsg}
          setLocationName={setLocationName}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 12,
    color: '#7a7a7a',
  },
  locationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  promoCard: {
    backgroundColor: '#d4edda',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoDescription: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8bc34a',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  categoryButton: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#8bc34a',
  },
  categoryText: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  activeCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  productPrice: {
    fontSize: 15,
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
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  productSection: {
    marginBottom: 20,
  },
  footer: {
    paddingVertical: 20,
  },
});

export default HomeScreen;
