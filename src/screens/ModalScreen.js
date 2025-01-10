// components/ModalScreen.js

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  PanResponder,
  Keyboard,
  Easing,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import ModalSuccess from '../components/ModalSuccess'; // Import ModalSuccess

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const MIN_MODAL_HEIGHT = SCREEN_HEIGHT * 0.5; // Disesuaikan untuk penanganan keyboard

const ModalScreen = ({ isVisible, onClose, setLocationName }) => {
  console.log('Modal props:', { isVisible, onClose, setLocationName });
  const { userData } = useAuth();
  const _user_id = userData?.user_id;
  const address = userData?.address
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // State untuk ModalSuccess

  const translateY = useRef(new Animated.Value(0)).current;

  // Listener untuk event keyboard
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Sesuaikan animasi untuk Android
        if (Platform.OS === 'android') {
          Animated.timing(translateY, {
            toValue: -e.endCoordinates.height * 0.5,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start();
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardHeight(0);
        if (Platform.OS === 'android') {
          Animated.timing(translateY, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start();
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [translateY]);

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

      // Mendapatkan detail alamat dari koordinat
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}&addressdetails=1`
      );

      const data = await response.json();

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}, Pekanbaru, Riau&format=json&addressdetails=1&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.log('Error fetching locations:', error);
      setSuggestions([]);
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
    Keyboard.dismiss(); // Menutup keyboard setelah memilih lokasi
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
        // Tampilkan modal keberhasilan
        console.log('Alamat berhasil diperbarui');
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
    <>
      {/* Modal Utama */}
      <Modal
        isVisible={isVisible}
        style={styles.modal}
        backdropTransitionOutTiming={0}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={Platform.OS === 'ios' ? 300 : 200}
        animationOutTiming={Platform.OS === 'ios' ? 300 : 200}
        backdropOpacity={0.5}
        useNativeDriver
        onBackdropPress={onClose}
        hideModalContentWhileAnimating
        statusBarTranslucent
        propagateSwipe
        swipeDirection={['down']}
        onSwipeComplete={onClose}
        swipeThreshold={Platform.OS === 'ios' ? 30 : 20}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalContent,
              {
                transform: [{ translateY }],
                maxHeight: MAX_MODAL_HEIGHT - keyboardHeight,
                minHeight: MIN_MODAL_HEIGHT,
              }
            ]}
          >
            <View style={styles.dragIndicator} />

            <View style={styles.searchContainer}>
              <View style={styles.searchBoxContainer}>
                <FontAwesome5 name="search" size={14} color="#9e9e9e" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={handleTextChange}
                  placeholder="Cari lokasi di Pekanbaru"
                  placeholderTextColor="#9e9e9e"
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    handleSearchLocation(searchText);
                  }}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.gpsButton,
                  isGettingLocation && styles.gpsButtonDisabled
                ]}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <LottieView
                    source={require('../assets/animations/loading1.json')} // Pastikan Anda memiliki loading.json di assets
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                ) : (
                  <FontAwesome5
                    name="location-arrow"
                    size={16}
                    color="#8bc34a"
                  />
                )}
              </TouchableOpacity>
            </View>

            {isGettingLocation && (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require('../assets/animations/loading1.json')} // Pastikan Anda memiliki loading.json di assets
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
                <Text style={styles.loadingText}>Mencari lokasi Anda...</Text>
              </View>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ScrollView
                style={styles.suggestionsContainer}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.place_id}-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => selectLocation(item)}
                    activeOpacity={0.7}
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
            <View style={styles.line} >
              <Text style={styles.lineText}><Text style={{ fontWeight: 'bold' }}>Lokasi Anda saat ini:</Text> {address}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedLocation && styles.confirmButtonDisabled
              ]}
              onPress={updateUserAddress}
              disabled={!selectedLocation}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                Konfirmasi Lokasi
              </Text>
            </TouchableOpacity>

            {/* Tambahkan Tombol untuk Menutup Modal Utama */}
            <TouchableOpacity
              style={styles.closeMainModalButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeMainModalText}>Tutup</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Keberhasilan */}
      <ModalSuccess
        isVisible={isSuccessModalVisible}
        onClose={() => {
          setIsSuccessModalVisible(false);
          onClose(); // Menutup modal utama setelah ModalSuccess selesai
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
    zIndex: 1000,
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: Platform.OS === 'ios' ? 24 : 20,
    borderTopRightRadius: Platform.OS === 'ios' ? 24 : 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    alignItems: 'stretch',
    maxHeight: Platform.OS === 'android' ? '90%' : undefined,
  },
  dragIndicator: {
    width: Platform.OS === 'ios' ? 40 : 36,
    height: Platform.OS === 'ios' ? 4 : 3,
    backgroundColor: '#E0E0E0',
    borderRadius: Platform.OS === 'ios' ? 2 : 1.5,
    alignSelf: 'center',
    marginVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBoxContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4, // Kurangi padding untuk Android
    minHeight: 44, // Tambahkan minHeight untuk konsistensi
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    padding: Platform.OS === 'ios' ? 0 : 8, // Tambahkan padding untuk Android
    margin: 0,
  },
  gpsButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gpsButtonDisabled: {
    opacity: 0.7,
  },
  lottie: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingAnimation: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#212121',
  },
  suggestionsContainer: {
    maxHeight: SCREEN_HEIGHT * 0.3,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
  },
  selectedLocationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  line: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#8bc34a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Tambahan: Tombol untuk menutup modal utama secara manual
  closeMainModalButton: {
    marginTop: 16,
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeMainModalText: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ModalScreen;
