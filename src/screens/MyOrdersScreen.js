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
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const MyOrdersScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'boarding'
  const API_BASE_URL = 'http://172.20.10.3:5000';
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  const fetchOrders = async () => {
    if (!userData?.user_id) return;

    try {
      setIsLoading(true);
      
      // Fetch product orders
      const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/user/${userData.user_id}`);
      const ordersData = await ordersResponse.json();

      // Fetch pet boarding orders
      const boardingResponse = await fetch(`${API_BASE_URL}/api/pet-boarding/user/${userData.user_id}`);
      const boardingData = await boardingResponse.json();

      // Transform boarding data to match order format
      const transformedBoardingData = boardingData.map(booking => ({
        ...booking,
        type: 'boarding',
        date: booking.created_at,
        total: booking.total_price
      }));

      // Transform orders data
      const transformedOrdersData = ordersData.map(order => ({
        ...order,
        type: 'product',
        date: order.created_at
      }));

      // Combine and sort all orders by date
      const allOrders = [...transformedOrdersData, ...transformedBoardingData]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil data pesanan');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Rp 0';
    return `Rp ${parseFloat(price).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const handleCancelOrder = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      });

      if (response.ok) {
        setIsCancelModalVisible(false);
        setSelectedOrder(null);
        fetchOrders(); // Refresh orders list
        Alert.alert('Sukses', 'Pesanan berhasil dibatalkan');
      } else {
        Alert.alert('Error', 'Gagal membatalkan pesanan');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membatalkan pesanan');
    }
  };

  const CancelOrderModal = () => (
    <Modal
      visible={isCancelModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsCancelModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Batalkan Pesanan</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsCancelModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalText}>
            Apakah Anda yakin ingin membatalkan pesanan ini?
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsCancelModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Tidak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleCancelOrder}
            >
              <Text style={styles.confirmButtonText}>Ya, Batalkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderOrderItem = ({ item }) => {
    const isBoarding = item.type === 'boarding';
    const canCancel = item.status === 'pending';

    // Hitung total harga berdasarkan tipe pesanan
    const totalPrice = isBoarding ? item.total_price : (
      // Untuk pesanan produk, pastikan menggunakan field yang benar
      item.total_price || item.total || 0
    );

    return (
      <TouchableOpacity 
        style={styles.orderItem}
        onPress={() => {
          if (isBoarding) {
            navigation.navigate('BookingSuccess', { bookingData: item });
          } else {
            navigation.navigate('OrderDetail', { orderId: item.order_id });
          }
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderType}>
            <Ionicons 
              name={isBoarding ? "paw" : "cart"} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.orderTypeText}>
              {isBoarding ? 'Penitipan' : 'Produk'}
            </Text>
          </View>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.orderContent}>
          <View style={styles.orderInfo}>
            {isBoarding ? (
              <>
                <Text style={styles.orderTitle}>{item.pet_category}</Text>
                <Text style={styles.orderDetail}>
                  {formatDate(item.start_date)} - {formatDate(item.end_date)}
                </Text>
                <Text style={styles.orderDetail}>
                  Durasi: {item.duration_days} hari
                </Text>
                <Text style={styles.priceDetail}>
                  {formatPrice(item.price_per_day)} × {item.duration_days} hari
                </Text>
                {item.tax > 0 && (
                  <Text style={styles.priceDetail}>
                    Pajak: {formatPrice(item.tax)}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.orderTitle}>Order #{item.order_id}</Text>
                {item.items && item.items.length > 0 ? (
                  <>
                    {item.items.map((product, index) => (
                      <View key={index}>
                        <Text style={styles.orderDetail}>{product.name}</Text>
                        <Text style={styles.priceDetail}>
                          {formatPrice(product.price)} × {product.quantity}
                        </Text>
                      </View>
                    ))}
                  </>
                ) : (
                  <Text style={styles.orderDetail}>{item.order_type}</Text>
                )}
              </>
            )}
          </View>

          <View style={styles.orderStatus}>
            <Text style={[
              styles.statusText,
              { backgroundColor: `${getStatusColor(item.status)}20`,
                color: getStatusColor(item.status) }
            ]}>
              {getStatusLabel(item.status)}
            </Text>
            <Text style={styles.totalPrice}>
              {formatPrice(totalPrice)}
            </Text>
            {canCancel && !isBoarding && (
              <TouchableOpacity
                style={styles.cancelOrderButton}
                onPress={() => {
                  setSelectedOrder(item);
                  setIsCancelModalVisible(true);
                }}
              >
                <Text style={styles.cancelOrderText}>Batalkan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'products') return order.type === 'product';
    if (activeTab === 'boarding') return order.type === 'boarding';
    return true;
  });

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
          <Text style={styles.headerTitle}>Pesanan Saya</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Semua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Produk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'boarding' && styles.activeTab]}
            onPress={() => setActiveTab('boarding')}
          >
            <Text style={[styles.tabText, activeTab === 'boarding' && styles.activeTabText]}>
              Penitipan
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C0EBA6" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => `${item.type}-${item.type === 'boarding' ? item.booking_id : item.order_id}`}
            contentContainerStyle={styles.orderList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#C0EBA6']}
                tintColor="#C0EBA6"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Belum ada pesanan</Text>
              </View>
            }
          />
        )}
        <CancelOrderModal />
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#C0EBA6',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  orderList: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTypeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderStatus: {
    alignItems: 'flex-end',
   justifyContent: 'flex-end',
    minWidth: 100, // Memberikan ruang minimum untuk harga
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50', // Warna hijau untuk total harga
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  priceDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelOrderButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },
  cancelOrderText: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MyOrdersScreen; 