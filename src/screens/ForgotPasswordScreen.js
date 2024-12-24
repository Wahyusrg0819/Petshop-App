import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { usePasswordReset } from '../context/PasswordResetContext';  // Menggunakan PasswordResetContext
import LottieView from 'lottie-react-native';  // Import Lottie

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State untuk animasi loading
  const { requestPasswordReset } = usePasswordReset(); // Menggunakan hook dari PasswordResetContext

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }

    setIsLoading(true); // Set loading menjadi true saat request dimulai

    try {
      // Kirim OTP ke email menggunakan PasswordResetContext
      const response = await requestPasswordReset(email);

      // Cek apakah berhasil mengirim OTP, lalu navigasi ke halaman OTP
      if (response.success) {
        // Pindahkan ke halaman OTP verification setelah request OTP
        navigation.navigate('OtpVerificationScreen', { email });
      } else {
        Alert.alert('Error', response.message || 'Gagal mengirim OTP');
      }
    } catch (error) {
      console.error('Error in handleRequestOTP:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengirim OTP');
    } finally {
      setIsLoading(false); // Set loading menjadi false setelah proses selesai
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lupa Kata Sandi</Text>
      <Text style={styles.description}>
        Masukkan email Anda untuk menerima kode OTP untuk mengatur ulang kata sandi.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A8A8A8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestOTP}
        disabled={isLoading} // Nonaktifkan tombol saat loading
      >
        <Text style={styles.buttonText}>Kirim OTP</Text>
      </TouchableOpacity>

      {isLoading && (
        <LottieView
          source={require('../assets/animations/loading.json')} // Pastikan file animasi JSON ada di folder assets/animations/
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>
          Kembali ke <Text style={styles.linkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 100,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#8F8F8F',
    marginBottom: 32,
    lineHeight: 20,
  },
  input: {
    height: 50,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  button: {
    backgroundColor: '#C0EBA6',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 14,
    color: '#8F8F8F',
  },
  linkText: {
    color: '#C0EBA6',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
