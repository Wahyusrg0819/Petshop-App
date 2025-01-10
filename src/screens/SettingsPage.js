import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SettingsPage = () => {
  const { logout } = useAuth();
  const { userData } = useAuth();
  const user_id = userData?.user_id;
  const navigation = useNavigation();

  const [isModalVisible, setModalVisible] = useState(false);

  const navigateToEditAccount = () => {
    navigation.navigate('EditAccountPage');
  };

  const navigateToPrivacy = () => {
    navigation.navigate('PrivacyPage');
  };

  const navigateToFAQ = () => {
    navigation.navigate('FAQPageScreen');
  };

  const navigateToKeamanan = () => {
    navigation.navigate('KeamananPage');
  };

  const navigateToMyOrders = () => {
    navigation.navigate('MyOrders');
  };

  const navigateToContactUs = () => {
    navigation.navigate('ContactUs');
  };

  const navigateToNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handleLogout = () => {
    setModalVisible(false);
    logout();
  };

  const handleCancelLogout = () => {
    setModalVisible(false);
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
            <Text style={styles.headerText}>Pengaturan</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
          >
            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Akun</Text>

              <TouchableOpacity style={styles.row} onPress={navigateToEditAccount}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Akun</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row} onPress={navigateToMyOrders}>
                <View style={styles.iconContainer}>
                  <Ionicons name="list-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Pesanan Saya</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.row}
                onPress={navigateToNotificationSettings}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Notifikasi</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="wallet-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Metode Pembayaran</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.row}
                onPress={navigateToPrivacy}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Privasi</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.row}
                onPress={navigateToKeamanan}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="key-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Keamanan</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Help Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Help</Text>

              <TouchableOpacity 
                style={styles.row}
                onPress={navigateToContactUs}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>Hubungi Kami</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.row} onPress={navigateToFAQ}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text-outline" size={20} color="black" />
                </View>
                <Text style={styles.rowText}>FAQ</Text>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>LOG OUT?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonRed]}
                onPress={handleLogout}
              >
                <Text style={styles.modalButtonText}>IYA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGreen]}
                onPress={handleCancelLogout}
              >
                <Text style={styles.modalButtonText}>TIDAK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  logoutButton: {
    marginTop: 20,
    marginBottom: 50,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#a8d391',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a8d391',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonRed: {
    backgroundColor: '#ff5c5c',
  },
  modalButtonGreen: {
    backgroundColor: '#a8d391',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsPage;
