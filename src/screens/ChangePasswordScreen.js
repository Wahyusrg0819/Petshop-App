import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    checkPasswordStrength(newPassword);
  }, [newPassword]);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  };

  const validatePassword = (password) => {
    return passwordStrength.length && 
           passwordStrength.uppercase && 
           passwordStrength.lowercase && 
           passwordStrength.number;
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!currentPassword) {
      newErrors.currentPassword = 'Password saat ini harus diisi';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Password baru harus diisi';
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password tidak memenuhi kriteria';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
      isValid = false;
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'Password baru tidak boleh sama dengan password saat ini';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const response = await axios.post('http://172.20.10.3:5000/api/change-password', {
        userId: userData.user_id,
        currentPassword,
        newPassword
      });

      Alert.alert(
        'Sukses', 
        'Password berhasil diubah',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Reset form dan kembali
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigation.goBack();
          }
        }]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.';
      
      if (errorMessage.includes('saat ini salah')) {
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Password saat ini salah'
        }));
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordStrength = () => (
    <View style={styles.strengthContainer}>
      <Text style={styles.strengthTitle}>Password harus memiliki:</Text>
      <View style={styles.strengthItem}>
        <Ionicons 
          name={passwordStrength.length ? "checkmark-circle-outline" : "close-circle-outline"} 
          size={20} 
          color={passwordStrength.length ? "#4CAF50" : "#FF3B30"}
        />
        <Text style={styles.strengthText}>Minimal 6 karakter</Text>
      </View>
      <View style={styles.strengthItem}>
        <Ionicons 
          name={passwordStrength.uppercase ? "checkmark-circle-outline" : "close-circle-outline"} 
          size={20} 
          color={passwordStrength.uppercase ? "#4CAF50" : "#FF3B30"}
        />
        <Text style={styles.strengthText}>Minimal 1 huruf besar</Text>
      </View>
      <View style={styles.strengthItem}>
        <Ionicons 
          name={passwordStrength.lowercase ? "checkmark-circle-outline" : "close-circle-outline"} 
          size={20} 
          color={passwordStrength.lowercase ? "#4CAF50" : "#FF3B30"}
        />
        <Text style={styles.strengthText}>Minimal 1 huruf kecil</Text>
      </View>
      <View style={styles.strengthItem}>
        <Ionicons 
          name={passwordStrength.number ? "checkmark-circle-outline" : "close-circle-outline"} 
          size={20} 
          color={passwordStrength.number ? "#4CAF50" : "#FF3B30"}
        />
        <Text style={styles.strengthText}>Minimal 1 angka</Text>
      </View>
    </View>
  );

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
              <Text style={styles.headerText}>Ubah Password</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Password Saat Ini</Text>
              <View style={[styles.inputContainer, errors.currentPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor="#C4C4C4"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    setErrors(prev => ({ ...prev, currentPassword: '' }));
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                    size={24} 
                    color="#C4C4C4"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword ? (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              ) : null}

              <Text style={styles.label}>Password Baru</Text>
              <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password baru"
                  placeholderTextColor="#C4C4C4"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={24} 
                    color="#C4C4C4"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              ) : null}

              {/* Password Strength Indicator */}
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthTitle}>Password harus memiliki:</Text>
                <View style={styles.strengthItem}>
                  <Ionicons 
                    name={passwordStrength.length ? "checkmark-circle-outline" : "close-circle-outline"} 
                    size={20} 
                    color={passwordStrength.length ? "#4CAF50" : "#FF3B30"}
                  />
                  <Text style={styles.strengthText}>Minimal 6 karakter</Text>
                </View>
                <View style={styles.strengthItem}>
                  <Ionicons 
                    name={passwordStrength.uppercase ? "checkmark-circle-outline" : "close-circle-outline"} 
                    size={20} 
                    color={passwordStrength.uppercase ? "#4CAF50" : "#FF3B30"}
                  />
                  <Text style={styles.strengthText}>Minimal 1 huruf besar</Text>
                </View>
                <View style={styles.strengthItem}>
                  <Ionicons 
                    name={passwordStrength.lowercase ? "checkmark-circle-outline" : "close-circle-outline"} 
                    size={20} 
                    color={passwordStrength.lowercase ? "#4CAF50" : "#FF3B30"}
                  />
                  <Text style={styles.strengthText}>Minimal 1 huruf kecil</Text>
                </View>
                <View style={styles.strengthItem}>
                  <Ionicons 
                    name={passwordStrength.number ? "checkmark-circle-outline" : "close-circle-outline"} 
                    size={20} 
                    color={passwordStrength.number ? "#4CAF50" : "#FF3B30"}
                  />
                  <Text style={styles.strengthText}>Minimal 1 angka</Text>
                </View>
              </View>

              <Text style={styles.label}>Konfirmasi Password Baru</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Konfirmasi password baru"
                  placeholderTextColor="#C4C4C4"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={24} 
                    color="#C4C4C4"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Button */}
            <TouchableOpacity 
              style={[
                styles.button, 
                isLoading && styles.buttonDisabled,
                !validatePassword(newPassword) && styles.buttonDisabled
              ]}
              onPress={handleChangePassword}
              disabled={isLoading || !validatePassword(newPassword)}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ubah Password</Text>
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
  strengthContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
  },
  strengthTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  strengthText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
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

export default ChangePasswordScreen;
