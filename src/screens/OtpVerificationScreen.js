import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { usePasswordReset } from '../context/PasswordResetContext'; // Menggunakan PasswordResetContext
import { useRoute } from '@react-navigation/native'; // Untuk mengambil parameter email dari navigasi

const OtpVerificationScreen = ({ navigation }) => {
  const route = useRoute();
  const { email } = route.params; // Mendapatkan email dari parameter navigasi

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTP } = usePasswordReset(); // Menggunakan fungsi verifyOTP dari PasswordResetContext

  // Log untuk memeriksa apakah email diterima dengan benar
  useEffect(() => {
    console.log('Email yang diterima di OTP Screen:', email);
  }, [email]);

  const handleSubmit = async () => {
    if (!otp) {
      Alert.alert('Error', 'OTP tidak boleh kosong');
      return;
    }

    setIsLoading(true);

    try {
      // Verifikasi OTP dengan API
      const result = await verifyOTP(email, otp); // Memanggil verifyOTP dari PasswordResetContext

      if (result.success) {
        console.log('OTP berhasil diverifikasi');
        // Setelah OTP berhasil diverifikasi, arahkan ke ResetPasswordScreen
        navigation.navigate('ResetPasswordScreen', { email, otp });
      } else {
        console.log('Verifikasi OTP gagal:', result.error);
        Alert.alert('Error', result.error || 'Gagal memverifikasi OTP');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memverifikasi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verifikasi OTP</Text>
      <Text style={styles.description}>
        Masukkan OTP yang telah dikirim ke email Anda: {email}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Masukkan OTP"
        placeholderTextColor="#A8A8A8"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verifikasi OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isLoading}
      >
        <Text style={styles.backButtonText}>
          Kembali ke <Text style={styles.linkText}>Lupa Kata Sandi</Text>
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
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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

export default OtpVerificationScreen;
