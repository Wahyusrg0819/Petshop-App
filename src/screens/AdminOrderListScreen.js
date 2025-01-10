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
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminOrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = 'http://172.20.10.3:5000';
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  const availableStatuses = [
    { label: 'Diproses', value: 'completed', color: '#4CAF50' },
    { label: 'Dibatalkan', value: 'cancelled', color: '#FF0000' },
    { label: 'Dikirim', value: 'delivered', color: '#2196F3' },
  ];

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await response.json();

      if (response.ok) {
        const groupedOrders = data.reduce((acc, order) => {
          const date = new Date(order.created_at);
          const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).toLowerCase();

          if (!acc[formattedDate]) {
            acc[formattedDate] = [];
          }
          acc[formattedDate].push(order);
          return acc;
        }, {});

        const formattedOrders = Object.entries(groupedOrders).map(([date, orders]) => ({
          date,
          orders: orders.map(order => ({
            id: order.order_id.toString(),
            customer: order.user_id,
            product: order.order_type,
            total: order.total_price,
            status: order.status,
            created_at: order.created_at,
            image: { uri: 'https://via.placeholder.com/48/C0EBA6/FFFFFF?text=RC' }
          }))
        })).sort((a, b) => new Date(b.orders[0].created_at) - new Date(a.orders[0].created_at));

        setOrders(formattedOrders);
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'An error occurred while fetching orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setIsStatusModalVisible(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        fetchOrders();
        setIsStatusModalVisible(false);
        setSelectedOrder(null);
      } else {
        Alert.alert('Error', 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'An error occurred while updating order');
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Diproses';
      case 'cancelled':
        return 'Dibatalkan';
      case 'pending':
        return 'Menunggu';
      case 'delivered':
        return 'Dikirim';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item: orderGroup }) => (
    <View style={styles.orderGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{orderGroup.date}</Text>
      </View>
      {orderGroup.orders.map((order) => (
        <TouchableOpacity 
          key={order.id}
          style={styles.orderItem}
          onPress={() => handleOrderPress(order)}
        >
          <View style={styles.orderContent}>
            <Image 
              source={order.image}
              style={styles.productImage}
            />
            <View style={styles.orderDetails}>
              <Text style={styles.customerName}>Customer ID: {order.customer}</Text>
              <Text style={styles.productInfo}>{order.product}</Text>
            </View>
            <View style={styles.orderStatus}>
              <Text style={[
                styles.statusText,
                order.status === 'pending' ? styles.pendingStatus : 
                order.status === 'cancelled' ? styles.cancelledStatus : 
                order.status === 'delivered' ? styles.deliveredStatus :
                styles.processedStatus
              ]}>
                {getStatusLabel(order.status)}
              </Text>
              <Text style={styles.totalPrice}>
                Rp {parseFloat(order.total).toLocaleString('id-ID', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color="#9e9e9e" 
              style={styles.chevronRight}
            />
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
          <Text style={styles.headerTitle}>Daftar Pesanan</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C0EBA6" />
            <Text style={styles.loadingText}>Memuat pesanan...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.date}
            contentContainerStyle={styles.orderList}
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
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 14,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    position: 'absolute',
    left: Platform.OS === 'ios' ? 16 : 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  orderList: {
    padding: Platform.OS === 'ios' ? 16 : 14,
  },
  dateHeader: {
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  orderItem: {
    marginBottom: 16,
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  orderStatus: {
    alignItems: 'flex-end',
    marginRight: 24,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  pendingStatus: {
    backgroundColor: '#FFF3E5',
    color: '#FF9800',
  },
  processedStatus: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  deliveredStatus: {
    backgroundColor: '#E3F2FD',
    color: '#2196F3',
  },
  cancelledStatus: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  chevronRight: {
    position: 'absolute',
    right: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  orderGroup: {
    marginBottom: 20,
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
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AdminOrderListScreen; 