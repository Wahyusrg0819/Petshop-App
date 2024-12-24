import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  RefreshControl, 
  Alert, 
  SafeAreaView, 
  ActivityIndicator 
} from "react-native";
import { FontAwesome5 } from '@expo/vector-icons';

export default function AdminAdjustment() {
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null); // State untuk tracking produk yang sedang dihapus

  const fetchProducts = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://172.20.10.2:5000/api/all'); // Ganti dengan URL backend Anda
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      } else {
        console.error(data.message);
        Alert.alert('Error', data.message || 'Gagal mengambil produk');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil produk');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Panggil fungsi fetchProducts saat komponen dimuat
  }, []);

  const handleDelete = (productId) => {
    Alert.alert(
      'Konfirmasi Penghapusan',
      'Apakah Anda yakin ingin menghapus produk ini?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          onPress: () => deleteProduct(productId),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const deleteProduct = async (productId) => {
    console.log('Attempting to delete product with ID:', productId);
    setDeletingProductId(productId); // Set state untuk menunjukkan produk yang sedang dihapus

    try {
      const response = await fetch(`http://172.20.10.2:5000/api/product/delete/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Hapus produk dari state lokal
        setProducts((prevProducts) => prevProducts.filter(product => product.product_id !== productId));
        Alert.alert('Sukses', data.message || 'Produk berhasil dihapus!');
      } else {
        console.error(data.message);
        Alert.alert('Error', data.message || 'Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghapus produk');
    } finally {
      setDeletingProductId(null); // Reset state setelah penghapusan selesai
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Produk</Text>
        <ScrollView 
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchProducts} 
              colors={['#9Bd35A']} 
              tintColor="#000"
            />
          }
        >
          {products.map((product) => (
            <AdjustmentCard
              key={product.product_id} // Pastikan untuk menggunakan ID unik
              name={product.name}
              price={`$${product.price}`} // Format harga sesuai kebutuhan
              image={{ uri: product.productPict }} // Menggunakan URI gambar
              onDelete={() => handleDelete(product.product_id)} // Pass the delete function
              deleting={deletingProductId === product.product_id} // Pass state deleting
            />
          ))}
          {products.length === 0 && !refreshing && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada produk tersedia.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function AdjustmentCard({ name, price, image, onDelete, deleting }) {
  return (
    <View style={styles.card}>
      <Image 
        source={image ? image : require('../../assets/images/default-avatar-image.png')} // Gambar placeholder jika tidak ada gambar
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} disabled={deleting}>
        {deleting ? (
          <ActivityIndicator size="small" color="#ff0000" />
        ) : (
          <FontAwesome5 name="trash" size={24} color="red" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#ffffff", 
    paddingBottom: 75 // Perbaikan: gunakan angka tanpa tanda kutip
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333'
  },
  card: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 15, 
    padding: 10, 
    borderRadius: 8, 
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  image: { 
    width: 60, 
    height: 60, 
    marginRight: 15, 
    borderRadius: 8, 
    backgroundColor: '#e0e0e0' // Warna latar belakang jika gambar belum dimuat
  },
  info: { 
    flex: 1 
  },
  name: { 
    fontSize: 16, 
    fontWeight: "600",
    color: '#333333'
  },
  price: { 
    fontSize: 14, 
    color: "green",
    marginTop: 4
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
