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
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminNotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin`);
      const data = await response.json();

      if (response.ok) {
        const formattedNotifications = data.map(notification => ({
          id: notification.notification_id.toString(),
          title: notification.title,
          message: notification.message,
          isRead: notification.is_read === 1,
          timestamp: new Date(notification.created_at).toLocaleDateString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          type: notification.notification_type,
          orderId: notification.order_id,
          image: { uri: 'https://via.placeholder.com/48/C0EBA6/FFFFFF?text=NT' }
        }));

        setNotifications(formattedNotifications);
      } else {
        Alert.alert('Error', 'Gagal mengambil notifikasi');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengambil notifikasi');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin/read/${notificationId}`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchNotifications();
      } else {
        Alert.alert('Error', 'Gagal menandai notifikasi sebagai telah dibaca');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memperbarui notifikasi');
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications([]);
      } else {
        Alert.alert('Error', 'Gagal menghapus semua notifikasi');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menghapus notifikasi');
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <Image 
        source={item.image}
        style={styles.notificationImage}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Hapus Semua</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C0EBA6" />
            <Text style={styles.loadingText}>Memuat notifikasi...</Text>
          </View>
        ) : notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.notificationList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#C0EBA6']}
                tintColor="#C0EBA6"
                title="Menarik untuk memperbarui..."
                titleColor="#666666"
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#9e9e9e" />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        )}
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
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: '500',
  },
  notificationList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadItem: {
    backgroundColor: '#F8FFF6',
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C0EBA6',
    position: 'absolute',
    top: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9e9e9e',
  },
});

export default AdminNotificationScreen; 