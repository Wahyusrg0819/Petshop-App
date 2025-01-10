import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const KeamananPage = () => {
  const navigation = useNavigation();

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePasswordScreen');
  };

  const navigateToChangeEmail = () => {
    navigation.navigate('ChangeEmailScreen');
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Keamanan</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          <ScrollView>
            {/* Security Options */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.row}
                onPress={navigateToChangePassword}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="key-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Ubah Password</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.row}
                onPress={navigateToChangeEmail}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Ubah Email</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 10,
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightHeaderPlaceholder: {
    width: 40,
  },
  headerText: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
});

export default KeamananPage;
