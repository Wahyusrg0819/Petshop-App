import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ModalScreen from './ModalScreen';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from "../context/AuthContext";

const PilihanPenitipanScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const user_id = userData?.user_id;
  const address = userData?.address;
  const [categories, setCategories] = useState([]);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationName, setLocationName] = useState(address || 'Fetching location...');
  const [loading, setLoading] = useState(true);

  // Objek pemetaan gambar berdasarkan category_name
  const categoryImages = {
    "Kucing": require("../assets/images/cat.png"),
    "Anjing": require("../assets/images/dog.png"),
    // Tambahkan pemetaan lainnya sesuai kebutuhan
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://172.20.10.3:5000/api/pet-categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Map data dari backend ke format yang dibutuhkan
        const mappedCategories = data.map(category => ({
          id: category.category_id.toString(), // Pastikan id sebagai string
          name: category.category_name,
          image: categoryImages[category.category_name] || require("../assets/images/comingsoon.jpg"),
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Alert.alert("Error", "Gagal mengambil data kategori hewan.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate('Schedule', { 
      category: category 
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8bc34a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationValue}>
              {locationName.length > 25
                ? `${locationName.slice(0, 25)}...`
                : locationName}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title1}>Titip Peliharaan</Text>
        <Text style={styles.title}>Anda</Text>

        {/* Kategori Section */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategori Hewan</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2} // Menampilkan dalam 2 kolom
            columnWrapperStyle={styles.row} // Styling baris kategori
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
      <ModalScreen
        isVisible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        location={location}
        errorMsg={errorMsg}
        setLocationName={setLocationName}
      />
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
    backgroundColor: "#ffffff",
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 20,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  locationLabel: {
    fontSize: Platform.OS === 'android' ? 12 : 12,
    color: "#7a7a7a",
  },
  locationValue: {
    fontSize: Platform.OS === 'android' ? 14 : 16,
    fontWeight: "bold",
    marginBottom: Platform.OS === 'android' ? 8 : 0,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  title1: {
    fontSize: 25,
    fontWeight: "bold",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    fontSize: 14,
    color: "#8bc34a",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryCard: {
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
  categoryImage: {
    width: 100,
    height: 140,
    resizeMode: "contain",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default PilihanPenitipanScreen;
