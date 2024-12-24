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
import axios from 'axios';  // Ensure axios is installed

const CreateAccountScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  // Handle Sign-Up and send data to the backend
  // frontend/CreateAccountScreen.js
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
    const response = await axios.post('http://172.20.10.2:5000/api/register', {
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
      <Text style={styles.title}>Buat Akun Baru</Text>
      <Text style={styles.description}>
        Anjing: Latih dengan sabar dan konsisten, ajak berjalan-jalan minimal
        30 menit sehari untuk menjaga kesehatan fisik dan mentalnya.
      </Text>

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={(text) => setFullName(text)}
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />

      {/* Terms & Conditions Checkbox */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setIsChecked}
        />
        <Text style={styles.checkboxLabel}>
          I agree to the{' '}
          <Text style={styles.link} onPress={() => { /* navigate to terms screen */ }}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => { /* navigate to privacy policy screen */ }}>
            Privacy Policy
          </Text>.
        </Text>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateAccountScreen;
