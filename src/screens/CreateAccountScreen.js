import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import axios from 'axios';

const CreateAccountScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleSignUp = async () => {
    // Validasi input fields
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!isChecked) {
      Alert.alert('Error', 'You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      // Kirim data dengan field sesuai backend
      const response = await axios.post('http://172.20.10.3:5000/api/register', {
        name: fullName,  // Ubah fullName menjadi name
        email,
        password,
      });

      // Handle success response
      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('LoginScreen'); // Navigasi setelah sukses
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while creating the account');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Halo,</Text>
        <Text style={styles.title}>Selamat Bergabung!</Text>
        <Text style={styles.description}>
          Anjing: Latih dengan sabar dan konsisten, ajak berjalan-jalan minimal
          30 menit sehari untuk menjaga kesehatan fisik dan mentalnya.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#7a7a7a"
        value={fullName}
        onChangeText={(text) => setFullName(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7a7a7a"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7a7a7a"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />

      <View style={styles.checkboxContainer}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setIsChecked}
          color={isChecked ? '#8bc34a' : undefined}
        />
        <Text style={styles.checkboxLabel}>
          I agree to the{' '}
          <Text style={styles.link}>Terms of Service</Text>{' '}
          and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={styles.signInText}>
          Sudah punya akun? <Text style={styles.link}>Masuk</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    marginBottom: 30,
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
    lineHeight: 20,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingRight: 10,
  },
  checkbox: {
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#7a7a7a',
    flex: 1,
  },
  link: {
    color: '#8bc34a',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#C0EBA6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInText: {
    fontSize: 14,
    color: '#7a7a7a',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CreateAccountScreen;
