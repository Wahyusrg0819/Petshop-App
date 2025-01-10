import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

export default function EditProduct({ route, navigation }) {
  const { productId } = route.params; // Mengambil productId dari parameter route
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image: null,
  });
  const [categories] = useState([
    { id: 1, name: "Pakan" },
    { id: 2, name: "Mainan" },
    { id: 3, name: "Aksesoris" },
  ]);
  const [loading, setLoading] = useState(false); // Spinner untuk loading data
  const [saving, setSaving] = useState(false); // Spinner untuk menyimpan data
  const [uploading, setUploading] = useState(false); // Spinner untuk upload gambar

  // Fungsi untuk mengambil detail produk menggunakan API getproduct
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://172.20.10.3:5000/api/getproduct/${productId}`);
      const data = await response.json();

      console.log("Respons dari API:", data);

      if (response.ok) {
        setProduct({
          name: data.product.name || "",
          description: data.product.description || "",
          price: data.product.price ? data.product.price.toString() : "",
          stock: data.product.stock ? data.product.stock.toString() : "",
          category_id: data.product.category_id || "",
          image: data.product.productPict || null,
        });
        console.log("State product setelah update:", {
          name: data.product.name || "",
          description: data.product.description || "",
          price: data.product.price ? data.product.price.toString() : "",
          stock: data.product.stock ? data.product.stock.toString() : "",
          category_id: data.product.category_id || "",
          image: data.product.productPict || null,
        });
      } else {
        Alert.alert("Error", "Gagal mengambil detail produk.");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil data produk.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memperbarui data produk (tanpa gambar)
  const handleSave = async () => {
    if (!product.name || !product.price || !product.stock || !product.category_id) {
      Alert.alert("Error", "Semua field wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `http://172.20.10.3:5000/api/product/update/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: parseInt(product.stock, 10),
            category_id: product.category_id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sukses", data.message);
        navigation.goBack(); // Kembali ke halaman sebelumnya
      } else {
        Alert.alert("Error", data.message || "Gagal memperbarui produk.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memperbarui produk.");
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk memilih dan mengunggah gambar
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Kami memerlukan akses ke galeri.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append("productPict", {
        uri: localUri,
        name: filename,
        type,
      });

      setUploading(true);
      try {
        const response = await fetch(
          `http://172.20.10.3:5000/api/productPict/${productId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProduct({ ...product, image: data.productPict });
          Alert.alert("Sukses", "Gambar produk berhasil diunggah.");
        } else {
          Alert.alert("Error", data.message || "Gagal mengunggah gambar.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengunggah gambar.");
      } finally {
        setUploading(false);
      }
    }
  };

  useEffect(() => {
    fetchProduct(); // Mengambil data produk saat halaman pertama kali dimuat
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat data produk...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Tombol Kembali */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Gambar Produk */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {uploading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <Image
              source={product.image ? { uri: product.image } : require("../../assets/images/no-image.png")}
              style={styles.productImage}
            />
          )}
          <View style={styles.editIconContainer}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Input Field dengan Data Lama */}
        <TextInput
          style={styles.input}
          placeholder="Nama Produk"
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Deskripsi"
          value={product.description}
          multiline
          onChangeText={(text) => setProduct({ ...product, description: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Harga"
          value={product.price}
          keyboardType="numeric"
          onChangeText={(text) => setProduct({ ...product, price: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Stok"
          value={product.stock}
          keyboardType="numeric"
          onChangeText={(text) => setProduct({ ...product, stock: text })}
        />

        <Picker
          selectedValue={product.category_id}
          style={styles.picker}
          onValueChange={(itemValue) => setProduct({ ...product, category_id: itemValue })}
        >
          <Picker.Item label="Pilih Kategori" value="" />
          {categories.map((category) => (
            <Picker.Item key={category.id} label={category.name} value={category.id} />
          ))}
        </Picker>

        {/* Tombol Simpan */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  imageContainer: {
    alignSelf: "center",
    marginBottom: 30,
    position: "relative",
  },
  productImage: {
    width: 325,
    height: 163,
    objectFit: "scale-down",
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#000",
    padding: 5,
    borderRadius: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#C0EBA6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
