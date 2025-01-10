import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native"; // Mengimpor useNavigation

export default function AdminAdjustment() {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation(); // Mendapatkan akses ke fungsi navigasi

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://172.20.10.3:5000/api/all");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to fetch products");
    }
  };

  const deleteProduct = async (productId, productName) => {
    try {
      const response = await fetch(
        `http://172.20.10.3:5000/api/product/delete/${productId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.product_id !== productId));
        setDeletedProductName(productName);
        setModalVisible(true);
      } else {
        // Cek apakah error karena foreign key constraint
        if (data.error && data.error.includes('foreign key constraint fails')) {
          setErrorModalVisible(true);
        } else {
          Alert.alert("Error", data.message || "Gagal menghapus produk");
        }
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert("Error", "Gagal menghapus produk");
    }
  };

  const renderRightActions = (productId, productName) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteProduct(productId, productName)}
    >
      <Ionicons name="trash-bin" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <SafeAreaView flex={1} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Produk</Text>
      </View>
      <View style={styles.container1}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {products.map((product) => (
            <Swipeable
              key={product.product_id}
              renderRightActions={() =>
                renderRightActions(product.product_id, product.name)
              }
            >
              <View style={styles.card}>
                <Image
                  source={product.productPict ? { uri: product.productPict } : require('../../assets/images/no-image.png')}
                  style={styles.image}
                />
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {product.name.length > 20 
                      ? product.name.substring(0, 20) + "..."
                      : product.name}
                  </Text>
                  <Text style={styles.subtitle}>
                    {product.description.length > 30
                      ? product.description.substring(0, 30) + "..."
                      : product.description}
                  </Text>
                  <Text style={styles.price}>
                    Rp {parseFloat(product.price).toLocaleString("id-ID")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("EditProduct", {
                      productId: product.product_id,
                    })
                  }
                >
                  <Ionicons name="pencil" size={20} color="#444" />
                </TouchableOpacity>
              </View>
            </Swipeable>
          ))}
          {products.length === 0 && (
            <Text style={styles.emptyText}>Tidak ada produk tersedia.</Text>
          )}
        </ScrollView>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={50} color="#C0EBA6" />
            <Text style={styles.modalText}>
              {deletedProductName} berhasil dihapus!
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={errorModalVisible}
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.errorModalContent]}>
            <Ionicons name="alert-circle" size={50} color="#FF6B6B" />
            <Text style={[styles.modalText, styles.errorTitle]}>
              Tidak Dapat Menghapus Produk
            </Text>
            <Text style={styles.errorDescription}>
              Produk ini tidak dapat dihapus karena masih terdapat orderan yang aktif.
            </Text>
            <Text style={styles.errorSubtext}>
              Harap tunggu sampai semua orderan selesai.
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, styles.errorButton]}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  container1: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F44336",
    width: 64,
    marginVertical: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: 280,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 16,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#C0EBA6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorModalContent: {
    width: 320,
    paddingVertical: 30,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
  },
});
