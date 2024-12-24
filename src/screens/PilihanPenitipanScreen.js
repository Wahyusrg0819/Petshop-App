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
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ModalScreen from './ModalScreen';
import * as Location from 'expo-location';


const PilihanPenitipanScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [location, setLocation] = useState(null);
   const [errorMsg, setErrorMsg] = useState(null);
  const [locationName, setLocationName] = useState('Fetching location...');

  useEffect(() => {
    // Simulasi data kategori penitipan
    const fetchedCategories = [
      {
        id: "1",
        name: "Kucing",
        image: "https://via.placeholder.com/150/92c952", // Gambar dari JSONPlaceholder
      },
      {
        id: "2",
        name: "Anjing",
        image: "https://via.placeholder.com/150/771796", // Gambar dari JSONPlaceholder
      },
      {
        id: "4",
        name: "More Pets Coming Soon",
        image: "https://via.placeholder.com/150/d32776", // Gambar dari JSONPlaceholder
      },
    ];
    setCategories(fetchedCategories);
  }, []);

  useEffect(() => {
    fetchUserLocation();
  }, []);  // Memanggil fetchUserLocation hanya saat komponen pertama kali dimuat
  
  const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLocationName('Permission denied');
        return;
      }
  
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
  
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}`
        );
        const data = await response.json();
        if (data && data.address) {
          setLocationName( data.address.village || data.address.town || data.address.city ||  'Unknown location');
        } else {
          setLocationName('Unknown location');
        }
      } catch (error) {
        setLocationName('Error fetching location name');
      }
    };
  

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate("ScheduleScreen", { category: item })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsLocationModalVisible(true)}>
                        <Text style={styles.locationLabel}>Location</Text>
                        <Text style={styles.locationValue}>{locationName}</Text>
          </TouchableOpacity>
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
          />
        </View>
      </View>
      <ModalScreen
        isVisible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        fetchUserLocation={fetchUserLocation}
        location={location}
        errorMsg={errorMsg}
        setLocationName={setLocationName}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 12,
    color: "#7a7a7a",
  },
  locationValue: {
    fontSize: 16,
    fontWeight: "bold",
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
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PilihanPenitipanScreen;
