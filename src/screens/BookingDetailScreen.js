import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingDetailScreen = ({ route, navigation }) => {
  const { booking, onStatusChange } = route.params;
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  const availableStatuses = [
    { label: 'Konfirmasi', value: 'confirmed', color: '#4CAF50' },
    { label: 'Sedang Berlangsung', value: 'ongoing', color: '#2196F3' },
    { label: 'Selesai', value: 'completed', color: '#8BC34A' },
    { label: 'Dibatalkan', value: 'cancelled', color: '#F44336' },
  ];

  const handleStatusChange = async (newStatus) => {
    await onStatusChange(newStatus);
    setIsStatusModalVisible(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
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
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
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
          <Text style={styles.headerTitle}>Detail Penitipan</Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setIsStatusModalVisible(true)}
          >
            <Ionicons name="create-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(booking.status)}20`, color: getStatusColor(booking.status) }
            ]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama</Text>
                <Text style={styles.infoValue}>{booking.customer_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID Booking</Text>
                <Text style={styles.infoValue}>#{booking.booking_id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal Booking</Text>
                <Text style={styles.infoValue}>{formatDate(booking.created_at)}</Text>
              </View>
            </View>
          </View>

          {/* Pet Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Penitipan</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jenis Hewan</Text>
                <Text style={styles.infoValue}>{booking.pet_category}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal Masuk</Text>
                <Text style={styles.infoValue}>{formatDate(booking.start_date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal Keluar</Text>
                <Text style={styles.infoValue}>{formatDate(booking.end_date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Durasi</Text>
                <Text style={styles.infoValue}>{booking.duration_days} hari</Text>
              </View>
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Harga per Hari</Text>
                <Text style={styles.infoValue}>
                  Rp {parseFloat(booking.price_per_day).toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pajak</Text>
                <Text style={styles.infoValue}>
                  Rp {parseFloat(booking.tax).toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={[styles.infoRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  Rp {parseFloat(booking.total_price).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
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
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    borderBottomWidth: 0,
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
  updateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
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

export default BookingDetailScreen; 