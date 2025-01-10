// components/ModalSuccess.js

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ModalSuccess = ({ isVisible, onClose }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset nilai animasi
      translateY.setValue(0);
      opacity.setValue(0);

      // Animasi muncul
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50, // Bergerak ke atas
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animasi menghilang
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -100, // Bergerak lebih ke atas saat menghilang
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose();
        });
      }, 1500);
    }
  }, [isVisible, onClose, translateY, opacity]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.alertContainer,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <Text style={styles.alertText}>✓ Alamat berhasil diperbarui!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  alertContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    maxWidth: '80%',
  },
  alertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ModalSuccess;
