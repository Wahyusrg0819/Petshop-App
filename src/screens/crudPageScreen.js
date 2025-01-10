import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const CrudPageScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { label: 'Pakan', value: 1 },
    { label: 'Mainan', value: 2 },
    { label: 'Aksesoris', value: 3 },
  ];

  // Periksa apakah pengguna adalah admin
  useEffect(() => {
    const checkAdminRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role !== 'admin') {
        Alert.alert('Error', 'Anda tidak memiliki izin untuk menambahkan produk.');
        navigation.replace('HomeScreen'); // Redirect user
      }
    };

    checkAdminRole();
  }, [navigation]);

  // Fungsi untuk memilih gambar
// Modifikasi fungsi pickImage untuk menyimpan URI saja
const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission Required', 'Izin akses galeri diperlukan');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};

// Modifikasi fungsi handleAddProduct untuk menggunakan nama produk sebagai nama file
const handleAddProduct = async () => {
  if (!name || !price || !stock || !categoryId || !image) {
    Alert.alert('Error', 'Mohon lengkapi semua kolom termasuk gambar!');
    return;
  }

  try {
    // Mendapatkan ekstensi file dari URI gambar
    const fileExtension = image.split('.').pop().toLowerCase();
    
    // Membuat nama file dari nama produk
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') // Mengganti karakter non-alphanumeric dengan underscore
      .replace(/_+/g, '_')        // Mengganti multiple underscore dengan single underscore
      .replace(/^_|_$/g, '');     // Menghapus underscore di awal dan akhir
    
    const fileName = `${sanitizedName}.${fileExtension}`;
    console.log('Generated filename:', fileName);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('stock', parseInt(stock));
    formData.append('category_id', categoryId);
    
    // Menambahkan file dengan nama yang sudah dibuat
    formData.append('productPict', {
      uri: image,
      type: `image/${fileExtension}`,
      name: fileName // Nama file yang sudah dibuat dari nama produk
    });

    console.log('FormData content:', {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId,
      fileName
    });

    const response = await fetch('http://172.20.10.3:5000/api/addProduct', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const textResponse = await response.text();
    console.log('Server response:', textResponse);
    
    try {
      const data = JSON.parse(textResponse);
      
      if (response.status === 201) {
        Alert.alert('Sukses', 'Produk berhasil ditambahkan!');
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setCategoryId('');
        setImage(null);
      } else {
        Alert.alert('Error', data.message || 'Gagal menambahkan produk');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      Alert.alert('Error', 'Respons server tidak valid');
    }
  } catch (error) {
    console.error('Network error:', error);
    Alert.alert('Error', 'Terjadi kesalahan jaringan');
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Tambah Produk</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Upload Gambar */}
        <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.uploadText}>Upload Gambar</Text>  
          ) }
        </TouchableOpacity> 

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Nama Produk"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Deskripsi Produk"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={styles.input}
          placeholder="Harga"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <TextInput
          style={styles.input}
          placeholder="Stok"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        {/* Dropdown Kategori */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoryId}
            onValueChange={(itemValue) => setCategoryId(itemValue)}
          >
            <Picker.Item label="Pilih Kategori" value="" />
            {categories.map((category) => (
              <Picker.Item key={category.value} label={category.label} value={category.value} />
            ))}
          </Picker>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddProduct}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Menambahkan...' : 'Tambahkan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 16,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  imagePlaceholder: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadText: {
    color: '#808080',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#B8EB92',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 45,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrudPageScreen;
