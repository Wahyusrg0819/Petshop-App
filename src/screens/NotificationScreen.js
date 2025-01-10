import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/user/${userData.user_id}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data);
      } else {
        console.error('Error fetching notifications:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.is_read);
      
      if (unreadNotifications.length > 0) {
        await Promise.all(
          unreadNotifications.map(async (notification) => {
            await fetch(`${API_BASE_URL}/api/notifications/read/${notification.notification_id}`, {
              method: 'PUT'
            });
          })
        );
        
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, [userData.user_id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => {
        navigation.navigate('MyOrders');
        
        fetch(`${API_BASE_URL}/api/notifications/read/${item.notification_id}`, {
          method: 'PUT'
        }).catch(error => {
          console.error('Error marking notification as read:', error);
        });
      }}
    >
      <View style={[styles.image, { backgroundColor: item.type === 'order' ? '#B5E6A1' : '#FFE0B2' }]}>
        <Ionicons 
          name={item.type === 'order' ? 'cart' : 'notifications'} 
          size={24} 
          color={item.type === 'order' ? '#4CAF50' : '#FF9800'} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.time}>{getTimeAgo(item.created_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B5E6A1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                markAllAsRead();
                navigation.goBack();
              }}
            >
              <Ionicons 
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
                size={24} 
                color="#000"
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Notifikasi</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          {/* Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Aktivitas</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={48} color="#C4C4C4" />
              <Text style={styles.emptyText}>Belum ada notifikasi</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.notification_id.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#B5E6A1']}
                  tintColor="#B5E6A1"
                />
              }
            />
          )}
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
    paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#B5E6A1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  listContainer: {
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default NotificationScreen;
