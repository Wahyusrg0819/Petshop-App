import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const ChangeEmailScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    if (!newEmail) {
      newErrors.email = 'Email baru harus diisi';
      isValid = false;
    } else if (!validateEmail(newEmail)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password harus diisi untuk verifikasi';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangeEmail = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const response = await axios.post('http://172.20.10.3:5000/api/change-email', {
        userId: userData.user_id,
        password,
        newEmail
      });

      Alert.alert(
        'Sukses', 
        'Email berhasil diubah',
        [{ 
          text: 'OK', 
          onPress: () => {
            setNewEmail('');
            setPassword('');
            navigation.goBack();
          }
        }]
      );
    } catch (error) {
      console.error('Error changing email:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah email. Silakan coba lagi.';
      
      if (errorMessage.includes('Password yang dimasukkan salah')) {
        setErrors(prev => ({
          ...prev,
          password: 'Password yang dimasukkan salah'
        }));
      } else if (errorMessage.includes('Email sudah digunakan')) {
        setErrors(prev => ({
          ...prev,
          email: 'Email sudah digunakan'
        }));
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerText}>Ubah Email</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Email Baru</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email baru"
                  placeholderTextColor="#C4C4C4"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  editable={!isLoading}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password untuk verifikasi"
                  placeholderTextColor="#C4C4C4"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24} 
                    color="#C4C4C4"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Button */}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleChangeEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: APPBAR_HEIGHT,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  form: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#B5E6A1",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ChangeEmailScreen;
