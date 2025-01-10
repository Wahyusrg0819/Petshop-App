import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingSuccessScreen = ({ route, navigation }) => {
  const { bookingData } = route.params;
  const [bookingStatus, setBookingStatus] = useState('pending');
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const fetchBookingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pet-boarding/user/${bookingData.user_id}`);
      const data = await response.json();
      
      const currentBooking = data.find(booking => booking.booking_id === bookingData.booking_id);
      if (currentBooking) {
        setBookingStatus(currentBooking.status);
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
    }
  };

  useEffect(() => {
    fetchBookingStatus();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#4CAF50';
      case 'ongoing': return '#2196F3';
      case 'completed': return '#8BC34A';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detail Pesanan</Text>
          </View>

          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Booking Berhasil!</Text>
            <Text style={styles.successMessage}>
              Pesanan penitipan Anda telah diterima dan sedang menunggu konfirmasi
            </Text>
          </View>

          {/* Booking Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nomor Booking</Text>
              <Text style={styles.detailValue}>#{bookingData.booking_id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jenis Hewan</Text>
              <Text style={styles.detailValue}>{bookingData.pet_category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Masuk</Text>
              <Text style={styles.detailValue}>{formatDate(bookingData.start_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Keluar</Text>
              <Text style={styles.detailValue}>{formatDate(bookingData.end_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Durasi</Text>
              <Text style={styles.detailValue}>{bookingData.duration_days} hari</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Harga per Hari</Text>
              <Text style={styles.detailValue}>
                Rp {parseFloat(bookingData.price_per_day).toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pajak</Text>
              <Text style={styles.detailValue}>
                Rp {parseFloat(bookingData.tax).toLocaleString('id-ID')}
              </Text>
            </View>

            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalValue}>
                Rp {parseFloat(bookingData.total_price).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>

          {/* Status Info */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Status Pesanan:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(bookingStatus)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(bookingStatus) }
              ]}>
                {getStatusLabel(bookingStatus)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={styles.okButton}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'BottomTabs', params: { screen: 'Home' } }],
            })}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  successIconContainer: {
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    margin: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 80,
  },
  statusTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  okButton: {
    backgroundColor: '#C0EBA6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingSuccessScreen; 