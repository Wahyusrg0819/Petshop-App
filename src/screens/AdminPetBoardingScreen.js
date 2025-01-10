import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableNativeFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminPetBoardingScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const availableStatuses = [
    { label: 'Konfirmasi', value: 'confirmed', color: '#4CAF50' },
    { label: 'Sedang Berlangsung', value: 'ongoing', color: '#2196F3' },
    { label: 'Selesai', value: 'completed', color: '#8BC34A' },
    { label: 'Dibatalkan', value: 'cancelled', color: '#F44336' },
  ];

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/pet-boarding`);
      const data = await response.json();

      if (response.ok) {
        // Kelompokkan booking berdasarkan tanggal
        const groupedBookings = data.reduce((acc, booking) => {
          const date = new Date(booking.created_at);
          const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          if (!acc[formattedDate]) {
            acc[formattedDate] = [];
          }
          acc[formattedDate].push(booking);
          return acc;
        }, {});

        const formattedBookings = Object.entries(groupedBookings).map(([date, bookings]) => ({
          date,
          bookings: bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }));

        setBookings(formattedBookings);
      } else {
        Alert.alert('Error', 'Gagal mengambil data penitipan');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetail', { 
      booking,
      onStatusChange: async (newStatus) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/pet-boarding/status/${booking.booking_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
          });

          if (response.ok) {
            fetchBookings();
            Alert.alert('Sukses', 'Status berhasil diperbarui');
          } else {
            Alert.alert('Error', 'Gagal mengubah status penitipan');
          }
        } catch (error) {
          console.error('Error updating booking:', error);
          Alert.alert('Error', 'Terjadi kesalahan saat mengubah status');
        }
      }
    });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pet-boarding/status/${selectedBooking.booking_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings();
        setIsStatusModalVisible(false);
        setSelectedBooking(null);
      } else {
        Alert.alert('Error', 'Gagal mengubah status penitipan');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengubah status');
    }
  };

  const getStatusColor = (status) => {
    const statusObj = availableStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const StatusModal = () => (
    <Modal
      visible={isStatusModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsStatusModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsStatusModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsStatusModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {availableStatuses.map((status) => (
            <TouchableOpacity
              key={status.value}
              style={styles.statusOption}
              onPress={() => handleStatusChange(status.value)}
            >
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={styles.statusOptionText}>{status.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderBookingItem = ({ item: bookingGroup }) => (
    <View style={styles.bookingGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{bookingGroup.date}</Text>
      </View>
      {bookingGroup.bookings.map((booking) => (
        <TouchableOpacity 
          key={booking.booking_id}
          style={styles.bookingItem}
          onPress={() => handleBookingPress(booking)}
        >
          <View style={styles.bookingContent}>
            <View style={styles.bookingDetails}>
              <Text style={styles.customerName}>
                Customer: {booking.customer_name}
              </Text>
              <Text style={styles.petInfo}>
                {booking.pet_category} • {booking.duration_days} hari
              </Text>
              <Text style={styles.dateInfo}>
                {new Date(booking.start_date).toLocaleDateString('id-ID')} - {new Date(booking.end_date).toLocaleDateString('id-ID')}
              </Text>
            </View>
            <View style={styles.bookingStatus}>
              <Text style={[
                styles.statusText,
                { backgroundColor: `${getStatusColor(booking.status)}20`, color: getStatusColor(booking.status) }
              ]}>
                {getStatusLabel(booking.status)}
              </Text>
              <Text style={styles.totalPrice}>
                Rp {parseFloat(booking.total_price).toLocaleString('id-ID')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9e9e9e" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daftar Penitipan</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C0EBA6" />
            <Text style={styles.loadingText}>Memuat data penitipan...</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={item => item.date}
            contentContainerStyle={styles.bookingList}
            showsVerticalScrollIndicator={false}
          />
        )}
        <StatusModal />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 48,
  },
  bookingList: {
    padding: 16,
  },
  bookingGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  bookingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bookingContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  petInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  dateInfo: {
    fontSize: 12,
    color: '#999',
  },
  bookingStatus: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default AdminPetBoardingScreen; 