// src/components/LoadingScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/login.json')}
        autoPlay
        loop
        style={styles.animation}
        speed={1.5} // Bisa disesuaikan kecepatannya
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Pastikan background putih untuk transisi yang smooth
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;