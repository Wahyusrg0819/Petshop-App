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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ContactUsScreen = () => {
  const navigation = useNavigation();

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+6281234567890');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@pawtopia.com');
  };

  const handleInstagram = () => {
    Linking.openURL('https://instagram.com/pawtopia');
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
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Hubungi Kami</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Contact Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Kontak</Text>
              <Text style={styles.description}>
                Kami siap membantu Anda dengan pertanyaan atau masalah yang Anda hadapi.
                Silakan hubungi kami melalui salah satu kontak di bawah ini:
              </Text>
            </View>

            {/* Contact Options */}
            <View style={styles.contactOptions}>
              {/* WhatsApp */}
              <TouchableOpacity 
                style={[styles.contactCard, styles.whatsappCard]} 
                onPress={handleWhatsApp}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#e7ffe1' }]}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>WhatsApp</Text>
                  <Text style={[styles.contactDetail, styles.whatsappDetail]}>+62 812-3456-7890</Text>
                  <Text style={styles.contactDescription}>
                    Respon cepat, Senin - Minggu (09.00 - 21.00 WIB)
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity 
                style={[styles.contactCard, styles.emailCard]} 
                onPress={handleEmail}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#fff0e9' }]}>
                  <Ionicons name="mail" size={24} color="#FF6B35" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email</Text>
                  <Text style={[styles.contactDetail, styles.emailDetail]}>support@pawtopia.com</Text>
                  <Text style={styles.contactDescription}>
                    Respon dalam 1-2 hari kerja
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity 
                style={[styles.contactCard, styles.instagramCard]} 
                onPress={handleInstagram}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#ffe1f4' }]}>
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Instagram</Text>
                  <Text style={[styles.contactDetail, styles.instagramDetail]}>@pawtopia</Text>
                  <Text style={styles.contactDescription}>
                    Follow kami untuk info terbaru
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Business Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Jam Operasional</Text>
              <View style={styles.businessHours}>
                <View style={styles.dayRow}>
                  <Text style={styles.day}>Senin - Jumat</Text>
                  <Text style={styles.hours}>09:00 - 21:00 WIB</Text>
                </View>
                <View style={[styles.dayRow, styles.lastDayRow]}>
                  <Text style={styles.day}>Sabtu - Minggu</Text>
                  <Text style={styles.hours}>10:00 - 20:00 WIB</Text>
                </View>
              </View>
            </View>

            {/* Address Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alamat</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location" size={20} color="#C0EBA6" style={styles.addressIcon} />
                <Text style={styles.addressText}>
                  Jl. Pawtopia No. 123{'\n'}
                  Kota Malang, Jawa Timur{'\n'}
                  Indonesia 65145
                </Text>
              </View>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rightHeaderPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactOptions: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  whatsappCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#25D366',
  },
  emailCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  instagramCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#E4405F',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
  },
  whatsappDetail: {
    color: '#25D366',
  },
  emailDetail: {
    color: '#FF6B35',
  },
  instagramDetail: {
    color: '#E4405F',
  },
  contactDescription: {
    fontSize: 12,
    color: '#666',
  },
  businessHours: {
    backgroundColor: '#f8fff4',
    borderRadius: 12,
    padding: 16,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lastDayRow: {
    borderBottomWidth: 0,
  },
  day: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  hours: {
    fontSize: 14,
    color: '#C0EBA6',
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fff4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ContactUsScreen; 