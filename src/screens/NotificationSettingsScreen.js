import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    petCare: true,
    systemUpdates: true,
  });

  const toggleSwitch = (key) => {
    setNotificationSettings(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
          <View style={styles.rightHeaderPlaceholder} />
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsContainer}>
          {/* Order Updates */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#e7ffe1' }]}>
                <Ionicons name="cart-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>Update Pesanan</Text>
                <Text style={styles.settingDescription}>
                  Notifikasi status dan pembaruan pesanan Anda
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#e0e0e0', true: '#C0EBA6' }}
              thumbColor={notificationSettings.orderUpdates ? '#4CAF50' : '#f4f3f4'}
              onValueChange={() => toggleSwitch('orderUpdates')}
              value={notificationSettings.orderUpdates}
            />
          </View>

          {/* Promotions */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff0e9' }]}>
                <Ionicons name="pricetag-outline" size={20} color="#FF6B35" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>Promo & Diskon</Text>
                <Text style={styles.settingDescription}>
                  Informasi tentang promo dan penawaran khusus
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#e0e0e0', true: '#C0EBA6' }}
              thumbColor={notificationSettings.promotions ? '#4CAF50' : '#f4f3f4'}
              onValueChange={() => toggleSwitch('promotions')}
              value={notificationSettings.promotions}
            />
          </View>

          {/* Pet Care Tips */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#e1f5fe' }]}>
                <Ionicons name="paw-outline" size={20} color="#039BE5" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>Tips Perawatan Hewan</Text>
                <Text style={styles.settingDescription}>
                  Tips dan informasi perawatan hewan peliharaan
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#e0e0e0', true: '#C0EBA6' }}
              thumbColor={notificationSettings.petCare ? '#4CAF50' : '#f4f3f4'}
              onValueChange={() => toggleSwitch('petCare')}
              value={notificationSettings.petCare}
            />
          </View>

          {/* System Updates */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="settings-outline" size={20} color="#8E24AA" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>Update Sistem</Text>
                <Text style={styles.settingDescription}>
                  Pembaruan sistem dan informasi penting lainnya
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#e0e0e0', true: '#C0EBA6' }}
              thumbColor={notificationSettings.systemUpdates ? '#4CAF50' : '#f4f3f4'}
              onValueChange={() => toggleSwitch('systemUpdates')}
              value={notificationSettings.systemUpdates}
            />
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Anda dapat mengubah pengaturan notifikasi kapan saja. Beberapa notifikasi penting terkait pesanan dan sistem tidak dapat dinonaktifkan.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightHeaderPlaceholder: {
    width: 40,
  },
  settingsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  noteContainer: {
    padding: 16,
    marginTop: 24,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default NotificationSettingsScreen; 