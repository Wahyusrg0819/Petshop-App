import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const FloatingNotification = ({ visible, message, onHide }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset nilai animasi
      translateY.setValue(0);
      opacity.setValue(0);

      // Animasi muncul dari tengah
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animasi menghilang ke atas setelah muncul
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: -100,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (onHide) {
              onHide();
            }
          });
        }, 1500);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY },
            ],
          },
        ]}
      >
        <Text style={styles.text} numberOfLines={2}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  container: {
    width: width * 0.7,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FloatingNotification; 