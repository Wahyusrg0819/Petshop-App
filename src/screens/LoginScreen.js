import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LottieView from 'lottie-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lottieRef = useRef(null);

  const { login } = useAuth();

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Prevent multiple submit
    if (isLoading) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      // Pastikan animasi mulai saat loading dimulai
      if (lottieRef.current) {
        lottieRef.current.play();
      }
      
      const result = await login(email, password);
      
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: result.role === 'admin' ? 'AdminDashboard' : 'HomeScreen' }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={lottieRef}
            source={require('../assets/animations/login.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Halo,</Text>
            <Text style={styles.title}>Selamat Datang </Text>
            <Text style={styles.title}>kembali!</Text>

            <Text style={styles.description}>
              Setiap hewan memiliki kebutuhan yang berbeda. Selalu konsultasikan
              dengan dokter hewan untuk mendapatkan saran yang paling tepat untuk
              hewan peliharaanmu.
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7a7a7a"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#7a7a7a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <View style={styles.forgotPasswordButton}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>or</Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateAccountScreen')} 
            disabled={isLoading}
          >
            <Text style={styles.signUpText}>
              Belum punya akun? <Text style={styles.linkText}>Buat Akun</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: isLoading ? '#d3d3d3' : '#C0EBA6' }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Masuk</Text>
          </TouchableOpacity>
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  darkBackground: {
    backgroundColor: '#333333', // Gelap saat loading
  },
  lottie: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  textContainer: {
    textAlign: 'left',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    color: '#000000',
  },
  description: {
    fontSize: 14,
    textAlign: 'left',
    color: '#7a7a7a',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    color: '#000000',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#8bc34a',
    marginTop: 10,
  },
  orText: {
    fontSize: 14,
    color: '#a9a9a9',
    marginVertical: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 50,
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#007aff',
  },
  signUpText: {
    fontSize: 14,
    color: '#7a7a7a',
    marginTop: 50,
    marginBottom: 10,
  },
  linkText: {
    color: '#8bc34a',
    fontWeight: 'bold',
  },
  loginButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
