import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { usePasswordReset } from '../context/PasswordResetContext'; // Menggunakan PasswordResetContext

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, otp } = route.params; // Mendapatkan email dan OTP dari parameter navigasi
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPasswordWithOTP } = usePasswordReset(); // Menggunakan hook dari PasswordResetContext

  // Fungsi untuk handle reset password
  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      Alert.alert('Error', 'Data tidak lengkap. Mohon masukkan email, OTP, dan password baru.');
      return;
    }
  
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter.');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const result = await resetPasswordWithOTP(email, otp, newPassword);
      if (result.success) {
        Alert.alert('Sukses', 'Password berhasil diubah', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoginScreen'),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengubah password');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Password</Text>
      <Text style={styles.description}>
        Masukkan password baru Anda untuk akun dengan email: {email}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Password Baru"
        placeholderTextColor="#A8A8A8"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Konfirmasi Password"
        placeholderTextColor="#A8A8A8"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && { backgroundColor: '#E0E0E0' }]} // Menonaktifkan tombol saat loading
        onPress={handleResetPassword}
        disabled={isLoading} // Menonaktifkan tombol saat loading
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" /> // Menampilkan loading indicator
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
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
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
