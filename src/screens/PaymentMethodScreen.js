import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PaymentMethodScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = useAuth();
  const { selectedItems, total } = route.params || {};
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const createOrder = async () => {
    if (!userData?.user_id || !selectedMethod) return;

    try {
      setIsLoading(true);
      
      // Payload untuk order
      const orderPayload = {
        user_id: userData.user_id,
        order_type: 'product',
        total_price: total,
        status: 'pending',
        payment_method: selectedMethod,
        items: selectedItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      // Kirim order ke backend
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Gagal membuat pesanan');
      }

      // Buat notifikasi untuk admin dengan order_id
      try {
        await fetch(`${API_BASE_URL}/api/notifications/admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Pesanan Baru',
            message: `Pesanan baru dari ${userData.username || 'Pelanggan'} - Total: Rp${total.toLocaleString('id-ID')}`,
            order_id: orderData.order_id,
            notification_type: 'order'
          })
        });
      } catch (error) {
        console.error('Error creating admin notification:', error);
      }

      // Hapus item dari cart
      await Promise.all(selectedItems.map(async (item) => {
        try {
          await fetch(`${API_BASE_URL}/api/cart/${item.cart_id}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error(`Error deleting cart item ${item.cart_id}:`, error);
        }
      }));

      navigation.replace('PaymentSuccess');
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuat pesanan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentConfirmation = () => {
    if (!selectedMethod) {
      Alert.alert('Peringatan', 'Silakan pilih metode pembayaran terlebih dahulu');
      return;
    }
    
    Alert.alert(
      'Konfirmasi Pesanan',
      'Apakah Anda yakin ingin melanjutkan pesanan?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Ya',
          onPress: createOrder,
        },
      ]
    );
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={[
        styles.safeArea,
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }
      ]}>
        <View style={[
          styles.container,
          { paddingBottom: insets.bottom }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Metode Pembayaran</Text>
            <View style={styles.backButton} />
          </View>

          {/* Payment Section */}
          <View style={styles.paymentSection}>
            <View>
              <Text style={styles.instructionText}>Pilih Metode Pembayaran Anda</Text>

              {/* Payment Options */}
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedMethod === 'DANA' && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedMethod('DANA')}
                >
                  <View style={styles.optionContent}>
                    <Ionicons name="wallet" size={24} color="#C0EBA6" />
                    <Text style={styles.optionText}>DANA</Text>
                  </View>
                  <Ionicons
                    name={selectedMethod === 'DANA' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedMethod === 'DANA' ? '#C0EBA6' : '#ddd'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    selectedMethod === 'Bank Transfer' && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedMethod('Bank Transfer')}
                >
                  <View style={styles.optionContent}>
                    <Ionicons name="card" size={24} color="#C0EBA6" />
                    <Text style={styles.optionText}>Bank Transfer</Text>
                  </View>
                  <Ionicons
                    name={selectedMethod === 'Bank Transfer' ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedMethod === 'Bank Transfer' ? '#C0EBA6' : '#ddd'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (!selectedMethod || isLoading) && styles.disabledCheckoutButton,
              ]}
              disabled={!selectedMethod || isLoading}
              onPress={handlePaymentConfirmation}
            >
              <Text style={styles.checkoutText}>
                {isLoading ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 12 : 0,
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 10 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: Platform.OS === 'android' ? 35 : 40,
    height: Platform.OS === 'android' ? 35 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  paymentSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  paymentOptions: {
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedOption: {
    borderColor: '#C0EBA6',
    backgroundColor: '#f8fff4',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#333',
    fontWeight: '500',
  },
  checkoutButton: {
    backgroundColor: '#C0EBA6',
    padding: Platform.OS === 'ios' ? 16 : 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#C0EBA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledCheckoutButton: {
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  checkoutText: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: '600',
  },
});

export default PaymentMethodScreen;
