import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Temukan yang peliharaan mu butuhkan disini
      </Text>
      <Image
        source={require('../../assets/images/onboarding.png')} // Pastikan Anda meletakkan gambar di folder yang sesuai
        style={styles.image}
      />
      <Text style={styles.description}>
        Dapatkan promo menarik disini, segera daftarkan akunmu agar bisa
        memenuhi kebutuhan peliharaanmu.
      </Text>

      <View style={styles.pagination}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')} // Sesuaikan dengan nama layar berikutnya
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#7a7a7a',
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d3d3d3',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#8bc34a',
  },
  button: {
    backgroundColor: '#8bc34a',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
