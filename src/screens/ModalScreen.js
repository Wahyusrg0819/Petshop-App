import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import MapView, { Marker } from 'react-native-maps';
import { getDistance } from 'geolib';
import debounce from 'lodash.debounce'; // Pastikan Anda telah menginstal lodash.debounce

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHTS = {
  full: SCREEN_HEIGHT * 0.85,
  partial: SCREEN_HEIGHT * 0.5,
};

const petShopLocation = {
  latitude: 0.45939201187033624,
  longitude: 101.45263211246288,
};

const ModalScreen = ({
  isVisible,
  onClose,
  fetchUserLocation,
  location,
  errorMsg,
  setLocationName,
}) => {
  const [searchText, setSearchText] = useState('');
  const [modalHeight, setModalHeight] = useState(MODAL_HEIGHTS.full);
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  const [region, setRegion] = useState({
    latitude: location?.coords.latitude || 37.78825,
    longitude: location?.coords.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [selectedLocation, setSelectedLocation] = useState(location);
  const [distance, setDistance] = useState(null);

  const locationCache = useRef({});

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderGrant: () => {
        translateY.setOffset(lastGestureDy.current);
        translateY.setValue(0);
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy >= 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        if (gestureState.dy > SCREEN_HEIGHT * 0.2 || gestureState.vy > 0.5) {
          onClose();
        } else if (gestureState.dy > SCREEN_HEIGHT * 0.1) {
          animateToHeight(MODAL_HEIGHTS.partial);
        } else {
          animateToHeight(MODAL_HEIGHTS.full);
        }
        lastGestureDy.current = 0;
      },
    })
  ).current;

  const animateToHeight = (height) => {
    setModalHeight(height);
    Animated.spring(translateY, {
      toValue: 0,
      tension: 50,
      friction: 12,
      useNativeDriver: true,
    }).start(() => {
      lastGestureDy.current = 0;
    });
  };

  useEffect(() => {
    if (isVisible) {
      setModalHeight(MODAL_HEIGHTS.full);
      translateY.setValue(0);
    }
  }, [isVisible]);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      calculateDistance(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  const isRegionChanged = useCallback(
    (newRegion) =>
      region.latitude !== newRegion.latitude ||
      region.longitude !== newRegion.longitude ||
      region.latitudeDelta !== newRegion.latitudeDelta ||
      region.longitudeDelta !== newRegion.longitudeDelta,
    [region]
  );

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const newRegion = {
      ...region,
      latitude,
      longitude,
    };
    if (isRegionChanged(newRegion)) {
      setRegion(newRegion);
      setSelectedLocation({
        coords: { latitude, longitude },
      });
      fetchLocationName(latitude, longitude);
      calculateDistance(latitude, longitude);
    }
  };

  const fetchLocationName = async (latitude, longitude) => {
    const key = `${latitude},${longitude}`;
    if (locationCache.current[key]) {
      setLocationName(locationCache.current[key]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      const name =
        data.address?.village ||
        data.address?.town ||
        data.address?.city ||
        'Unknown location';
      locationCache.current[key] = name;
      setLocationName(name);
    } catch {
      setLocationName('Error fetching location name');
    }
  };

  const calculateDistance = (userLat, userLon) => {
    const dist = getDistance(
      { latitude: userLat, longitude: userLon },
      petShopLocation
    );
    setDistance(dist);
  };

  const debouncedSetSearchText = useCallback(
    debounce((text) => setSearchText(text), 300),
    []
  );

  const animatedStyle = {
    transform: [{ translateY }],
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      backdropTransitionOutTiming={0}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      backdropOpacity={0.5}
      useNativeDriver
      propagateSwipe
      onBackdropPress={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalContent, animatedStyle, { height: modalHeight }]}>
        <View {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Lokasi</Text>
          </View>
        </View>

        <View style={styles.searchBoxContainer}>
          <FontAwesome5 name="search" size={14} color="#9e9e9e" style={styles.searchIcon} />
          <TextInput
            style={styles.locationInput}
            placeholder="Cari Lokasi"
            placeholderTextColor="#9e9e9e"
            onChangeText={debouncedSetSearchText}
          />
        </View>

        <TouchableOpacity
          style={styles.locationOption}
          onPress={fetchUserLocation}
          activeOpacity={0.7}
        >
          <View style={styles.locationIconContainer}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#ffffff" />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationOptionTitle}>Lacak Lokasi Anda</Text>
            <Text numberOfLines={1} style={styles.locationOptionSubtitle}>
              {location
                ? `Lokasi: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                : 'Gunakan lokasi saat ini'}
            </Text>
          </View>
        </TouchableOpacity>

        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {selectedLocation && <Marker coordinate={selectedLocation.coords} />}
        </MapView>

        {distance !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              Jarak Anda dengan Pet Shop: {(distance / 1000).toFixed(2)} km
            </Text>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    padding: 0,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8bc34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  locationOptionSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  map: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  distanceContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ModalScreen;
