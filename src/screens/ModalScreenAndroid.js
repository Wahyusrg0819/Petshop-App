import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
  Keyboard,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import ModalSuccess from '../components/ModalSuccess';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const MIN_MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;

const ModalScreenAndroid = ({ isVisible, onClose, setLocationName }) => {
  const { userData } = useAuth();
  const address = userData?.address;
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;

  // Pan Responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Ditolak',
          'Silakan izinkan akses lokasi untuk menggunakan fitur GPS',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const hasPermission = await getLocationPermission();

      if (!hasPermission) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Mendapatkan detail alamat dari koordinat menggunakan axios
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'id'
          },
          timeout: 30000
        }
      );

      const data = response.data;
      if (data && data.display_name) {
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: data.display_name
        };

        setSelectedLocation(locationData);
        setLocationName(data.display_name);
        setSearchText(data.display_name);
        setShowSuggestions(false);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Gagal mendapatkan lokasi saat ini. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
      console.error('Error getting location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearchLocation = async (text) => {
    if (!text || text.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}, Pekanbaru, Riau&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept-Language': 'id'
          },
          timeout: 30000
        }
      );

      const data = response.data;
      if (Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSuggestions([]);
      Alert.alert(
        'Error',
        'Gagal mencari lokasi. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    }
  };

  const debouncedSearch = useCallback(
    debounce((text) => handleSearchLocation(text), 500),
    []
  );

  const handleTextChange = (text) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const selectLocation = (location) => {
    const { lat, lon, display_name } = location;
    setSelectedLocation({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      address: display_name
    });
    setLocationName(display_name);
    setSearchText(display_name);
    setShowSuggestions(false);
  };

  const updateUserAddress = async () => {
    if (!userData?.user_id || !selectedLocation?.address) {
      Alert.alert('Error', 'Silakan pilih lokasi terlebih dahulu');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Error', 'Token otentikasi tidak ditemukan');
        return;
      }

      const response = await axios.put(
        `http://172.20.10.3:5000/api/updateAddress/${userData.user_id}`,
        { address: selectedLocation.address },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      if (response.status === 200) {
        setIsSuccessModalVisible(true);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Gagal memperbarui alamat. Silakan coba lagi.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalView,
              {
                transform: [{ translateY }],
              }
            ]}
          >
            <View style={styles.dragIndicator} />

            <View style={styles.searchContainer}>
              <View style={styles.searchBoxContainer}>
                <FontAwesome5 name="search" size={16} color="#9e9e9e" />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={(text) => {
                    setSearchText(text);
                    handleSearchLocation(text);
                  }}
                  placeholder="Cari lokasi di Pekanbaru"
                  placeholderTextColor="#9e9e9e"
                />
              </View>

              <TouchableOpacity
                style={[styles.gpsButton, isGettingLocation && styles.gpsButtonDisabled]}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <LottieView
                    source={require('../assets/animations/loading1.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                ) : (
                  <>
                    <FontAwesome5 name="location-arrow" size={16} color="#ffffff" />
                    <Text style={styles.gpsButtonText}>Gunakan Lokasi Saat Ini</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <ScrollView style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.place_id}-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => selectLocation(item)}
                  >
                    <FontAwesome5
                      name="map-marker-alt"
                      size={14}
                      color="#8bc34a"
                      style={styles.suggestionIcon}
                    />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.line}>
              <Text style={styles.lineText}>
                <Text style={{ fontWeight: 'bold' }}>Lokasi Anda saat ini:</Text> {address}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
              onPress={updateUserAddress}
              disabled={!selectedLocation}
            >
              <Text style={styles.confirmButtonText}>Konfirmasi Lokasi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <ModalSuccess
        isVisible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
          onClose();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    elevation: 10,
    maxHeight: '80%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginBottom: 12,
    elevation: 2,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    paddingVertical: 8,
    includeFontPadding: false,
  },
  gpsButton: {
    backgroundColor: '#8bc34a',
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    elevation: 2,
  },
  gpsButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  gpsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  lottie: {
    width: 24,
    height: 24,
  },
  suggestionsContainer: {
    maxHeight: SCREEN_HEIGHT * 0.3,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  line: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  lineText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#8bc34a',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#212121',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ModalScreenAndroid; 