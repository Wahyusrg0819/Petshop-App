import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Konstanta untuk warna
const COLORS = {
  primary: '#C0EBA6',
  secondary: '#4A4A4A',
  background: '#FFFFFF',
  inputBorder: '#E8E8E8',
  inputBackground: '#F9F9F9',
  text: '#333333',
  error: '#FF6B6B',
  success: '#4CAF50',
};

const EditAccountPage = ({ navigation }) => {
  const { userData, updateUserDataIfEmpty, setUserData } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setUsername(userData.username || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
    } else {
      updateUserDataIfEmpty();
    }
  }, [userData]);

  const selectAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    if (!userData?.user_id) return;
    
    try {
      setIsUploadingImage(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      });

      const response = await axios.post(
        'http://172.20.10.3:5000/api/uploadpict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setUserData(prevData => ({
          ...prevData,
          profilePicture: response.data.profilePicture,
        }));
        Alert.alert('Success', 'Foto profil berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert(
        'Error', 
        'Gagal mengupload foto profil. ' + 
        (error.response?.data?.message || 'Silakan coba lagi.')
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!name || !username || !email || !phone) {
      Alert.alert('Error', 'Mohon lengkapi semua field.');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan. Silakan login kembali.');
        return;
      }

      const userId = userData?.user_id;
      if (!userId) {
        Alert.alert('Error', 'ID Pengguna tidak ditemukan.');
        return;
      }

      const response = await axios.put(
        `http://172.20.10.3:5000/api/updateProfile/${userId}`,
        { name, username, email, phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.user) {
        setUserData(response.data.user);
      }
      Alert.alert('Sukses', 'Profil berhasil diperbarui.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={text => {
          if (onChangeText) {
            onChangeText(text);
          }
        }}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        enablesReturnKeyAutomatically
        returnKeyType="next"
        blurOnSubmit={false}
      />
    </View>
  );

  const nameRef = React.useRef();
  const usernameRef = React.useRef();
  const emailRef = React.useRef();
  const phoneRef = React.useRef();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profil</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.profileContainer}>
              <TouchableOpacity 
                style={styles.profileImage}
                onPress={selectAndUploadImage}
                disabled={isUploadingImage}
              >
                {userData?.profilePicture ? (
                  <Image
                    source={{ uri: userData.profilePicture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Ionicons name="person-circle-outline" size={80} color={COLORS.secondary} />
                  </View>
                )}
                {isUploadingImage ? (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color={COLORS.background} />
                  </View>
                ) : (
                  <View style={styles.editProfileButton}>
                    <Ionicons name="camera" size={20} color={COLORS.secondary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                ref={nameRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama Anda"
                placeholderTextColor="#999"
                returnKeyType="next"
                onSubmitEditing={() => usernameRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextInput
                ref={usernameRef}
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username Anda"
                placeholderTextColor="#999"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                autoCapitalize="none"
              />
              <TextInput
                ref={emailRef}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Masukkan email Anda"
                placeholderTextColor="#999"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
                autoCapitalize="none"
              />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Masukkan nomor telepon Anda"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleSaveChanges}
              />

              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 20,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  backButton: {
    padding: Platform.OS === 'android' ? 6 : 8,
    marginLeft: Platform.OS === 'android' ? -6 : -8,
  },
  headerText: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: '600',
    color: COLORS.secondary,
    marginLeft: Platform.OS === 'android' ? 10 : 12,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  form: {
    paddingTop: 16,
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditAccountPage;
