import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const alertWidth = Math.min(width * 0.9, 400);

const DeleteCartModal = ({ visible, onClose }) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Reset nilai animasi
      translateY.setValue(0);
      opacity.setValue(1);

      // Mulai animasi mengambang ke atas dan menghilang
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.alert,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.alertText}>Item has been removed from cart!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alert: {
    width: alertWidth,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  alertText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DeleteCartModal; 