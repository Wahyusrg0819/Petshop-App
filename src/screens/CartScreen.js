import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
  Dimensions,
  PanResponder,
  StatusBar,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import DeleteCartModal from '../components/DeleteCartModal';
import Modal from 'react-native-modal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CHECKOUT_HEIGHT = 280; // Perkiraan tinggi checkout container

const CartScreen = () => {
  const navigation = useNavigation();
  const [cart, setCart] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const { userData } = useAuth();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const translateY = useRef(new Animated.Value(CHECKOUT_HEIGHT)).current;
  const lastGestureDy = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastGestureDy.current = translateY._value;
      },
      onPanResponderMove: (_, { dy }) => {
        const newValue = lastGestureDy.current + dy;
        if (newValue >= 0) {
          translateY.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 50 || vy > 0.5) {
          // Swipe down
          Animated.spring(translateY, {
            toValue: CHECKOUT_HEIGHT,
            useNativeDriver: true,
            bounciness: 0,
            speed: 12,
          }).start(() => setSelectedProductIds([]));
        } else {
          // Return to top
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
          }).start();
        }
      },
    })
  ).current;

  const fetchCartData = async () => {
    if (!userData || !userData.user_id) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://172.20.10.3:5000/api/view/${userData.user_id}`
      );
      const data = await response.json();

      if (response.ok) {
        setCart(data.cart || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch cart data");
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while fetching cart data"
      );
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [userData]);

  useEffect(() => {
    if (selectedProductIds.length > 0 && !isDeleteMode) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: CHECKOUT_HEIGHT,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12,
      }).start();
    }
  }, [selectedProductIds, isDeleteMode]);

  const handleRemoveFromCart = async (cart_id) => {
    try {
      const response = await fetch(
        `http://172.20.10.3:5000/api/delete/${cart_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedProductIds(prev => prev.filter(id => id !== cart_id));
        setCart((prevCart) => prevCart.filter((item) => item.cart_id !== cart_id));
        setIsDeleteModalVisible(true);
      } else {
        Alert.alert("Error", data.message || "Failed to remove product from cart");
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while removing product"
      );
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const renderRightActions = (progress, dragX, cart_id) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleRemoveFromCart(cart_id)}
      >
        <Animated.View 
          style={[
            styles.deleteActionContent,
            { transform: [{ scale }] }
          ]}
        >
          <FontAwesome5 name="trash" size={20} color="#fff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCartItem = ({ item }) => {
    const isSelected = selectedProductIds.includes(item.cart_id);

    return (
      <Swipeable
        enabled={!isDeleteMode}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.cart_id)
        }
      >
        <TouchableOpacity
          style={[styles.cartItem, isSelected && styles.selectedItem]}
          onPress={() => handleSelectProduct(item.cart_id)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: item.productPict }}
            style={styles.cartItemImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>
              {item.product_name.length > 20
                ? item.product_name.slice(0, 20) + "..."
                : item.product_name}
            </Text>
            <Text style={styles.productDescription}>
              {item.description && item.description.length > 35
                ? item.description.slice(0, 35) + "..."
                : item.description || "No description available"}
            </Text>
            <Text style={styles.productPrice}>
              Rp {parseFloat(item.price).toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const calculateTotal = () => {
    const selectedItems = cart.filter((item) =>
      selectedProductIds.includes(item.cart_id)
    );
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.12; // pajak 12% sesuai request pak wowo
    const total = subtotal + tax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleDeleteSelected = async () => {
    try {
      for (const cartId of selectedProductIds) {
        const response = await fetch(
          `http://172.20.10.3:5000/api/delete/${cartId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete some items');
        }
      }
      
      // Update cart setelah delete
      setCart((prevCart) => prevCart.filter((item) => !selectedProductIds.includes(item.cart_id)));
      setSelectedProductIds([]);
      setIsDeleteMode(false);
      setIsDeleteModalVisible(true);
    } catch (error) {
      console.error("Error deleting products:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while deleting products"
      );
    }
  };

  const handleCheckout = () => {
    if(selectedProductIds.length > 0) {
      const selectedItems = cart.filter(item => selectedProductIds.includes(item.cart_id)).map(item => ({
        cart_id: item.cart_id,
        product_id: item.product_id,
        product_name: item.product_name,
        productPict: item.productPict,
        description: item.description,
        quantity: item.quantity,
        price: item.price
      }));
      const { total } = calculateTotal();
      navigation.navigate('PaymentMethod', {
        selectedItems,
        total: parseFloat(total)
      });
    }
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <DeleteCartModal
          visible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
        />
        <View style={styles.Container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.header}>Keranjang</Text>
            {cart.length > 0 && (
              <View style={styles.headerActions}>
                {selectedProductIds.length > 0 && isDeleteMode && (
                  <TouchableOpacity 
                    style={[styles.headerButton, { marginRight: 8, backgroundColor: '#fff0f0' }]}
                    onPress={handleDeleteSelected}
                  >
                    <FontAwesome5 name="trash" size={18} color="#ff4d4d" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[
                    styles.headerButton,
                    isDeleteMode && { backgroundColor: '#fff0f0' }
                  ]}
                  onPress={() => {
                    setIsDeleteMode(!isDeleteMode);
                    setSelectedProductIds([]);
                  }}
                >
                  <Text style={[
                    styles.selectButtonText,
                    isDeleteMode && { color: '#ff4d4d' }
                  ]}>
                    {isDeleteMode ? 'Cancel' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {cart.length > 0 ? (
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.cart_id.toString()}
              contentContainerStyle={[
                styles.listContainer,
                selectedProductIds.length > 0 && { paddingBottom: 280 }
              ]}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          )}
        </View>
      </SafeAreaView>
      {!isDeleteMode && (
        <Modal
          isVisible={selectedProductIds.length > 0}
          onSwipeComplete={() => setSelectedProductIds([])}
          swipeDirection={['down']}
          style={[styles.modal, { pointerEvents: 'box-none' }]}
          backdropOpacity={0}
          propagateSwipe={true}
          useNativeDriver={true}
          statusBarTranslucent
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationInTiming={Platform.OS === 'ios' ? 300 : 200}
          animationOutTiming={Platform.OS === 'ios' ? 300 : 200}
          backdropTransitionInTiming={0}
          backdropTransitionOutTiming={0}
          swipeThreshold={Platform.OS === 'ios' ? 30 : 20}
          hasBackdrop={false}
          coverScreen={false}
        >
          <View style={styles.checkoutContainer}>
            <View style={styles.checkoutHandle} />
            <View style={styles.checkoutContent}>
              <View style={styles.checkoutSummary}>
                <Text style={styles.checkoutText}>Subtotal:</Text>
                <Text style={styles.checkoutText}>
                  Rp {parseFloat(calculateTotal().subtotal).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.checkoutSummary}>
                <Text style={styles.checkoutText}>Tax (12%):</Text>
                <Text style={styles.checkoutText}>
                  Rp {parseFloat(calculateTotal().tax).toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={[styles.checkoutSummary, styles.totalRow]}>
                <Text style={styles.checkoutTotalText}>Total:</Text>
                <Text style={styles.checkoutTotalText}>
                  Rp {parseFloat(calculateTotal().total).toLocaleString("id-ID")}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>
                  Checkout ({selectedProductIds.length} items)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  Container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 14,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: Platform.OS === 'ios' ? 40 : 36,
    height: Platform.OS === 'ios' ? 40 : 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flex: 1,
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: Platform.OS === 'ios' ? 12 : 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: Platform.OS === 'ios' ? 100 : 90,
    justifyContent: 'flex-end',
  },
  headerButton: {
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 10,
    height: Platform.OS === 'ios' ? 36 : 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    backgroundColor: '#f8f8f8',
  },
  selectButtonText: {
    fontSize: Platform.OS === 'ios' ? 13 : 12,
    color: '#C0EBA6',
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
    padding: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: Platform.OS === 'ios' ? 6 : 4,
    elevation: 3,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 104 : 96,
  },
  selectedItem: {
    backgroundColor: '#f8fff4',
    borderColor: '#C0EBA6',
    borderWidth: Platform.OS === 'ios' ? 1.5 : 1,
  },
  cartItemImage: {
    width: Platform.OS === 'ios' ? 80 : 76,
    height: Platform.OS === 'ios' ? 80 : 76,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    marginRight: Platform.OS === 'ios' ? 12 : 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? 80 : 76,
    paddingVertical: Platform.OS === 'ios' ? 4 : 3,
  },
  productName: {
    fontSize: Platform.OS === 'ios' ? 15 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: Platform.OS === 'ios' ? 4 : 3,
  },
  productDescription: {
    fontSize: Platform.OS === 'ios' ? 13 : 12,
    color: '#666',
    marginBottom: Platform.OS === 'ios' ? 4 : 3,
    lineHeight: Platform.OS === 'ios' ? 18 : 16,
  },
  productPrice: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#C0EBA6',
    fontWeight: 'bold',
  },
  quantityBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 10,
    right: Platform.OS === 'ios' ? 12 : 10,
    backgroundColor: '#C0EBA6',
    borderRadius: Platform.OS === 'ios' ? 20 : 18,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 8,
    paddingVertical: Platform.OS === 'ios' ? 4 : 3,
    minWidth: Platform.OS === 'ios' ? 30 : 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadgeText: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 13 : 12,
    fontWeight: '600',
  },
  deleteAction: {
    height: Platform.OS === 'ios' ? 104 : 96,
    width: Platform.OS === 'ios' ? 80 : 76,
    backgroundColor: '#fff0f0',
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Platform.OS === 'ios' ? 12 : 10,
  },
  deleteActionContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#ff4d4d',
    borderRadius: Platform.OS === 'ios' ? 16 : 14,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 12 : 11,
    fontWeight: '600',
    marginTop: Platform.OS === 'ios' ? 4 : 3,
  },
  emptyCartText: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    color: '#666',
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 36,
    fontWeight: '500',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: Platform.OS === 'ios' ? 24 : 20,
    borderTopRightRadius: Platform.OS === 'ios' ? 24 : 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderBottomWidth: 0,
  },
  checkoutHandle: {
    width: Platform.OS === 'ios' ? 40 : 36,
    height: Platform.OS === 'ios' ? 4 : 3,
    backgroundColor: '#E0E0E0',
    borderRadius: Platform.OS === 'ios' ? 2 : 1.5,
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 8 : 6,
  },
  checkoutContent: {
    padding: Platform.OS === 'ios' ? 20 : 16,
  },
  checkoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  checkoutText: {
    fontSize: Platform.OS === 'ios' ? 14 : 13,
    color: '#666',
    fontWeight: '500',
  },
  checkoutTotalText: {
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    marginTop: Platform.OS === 'ios' ? 4 : 3,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  checkoutButton: {
    backgroundColor: '#C0EBA6',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    padding: Platform.OS === 'ios' ? 16 : 14,
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: Platform.OS === 'ios' ? 16 : 15,
    fontWeight: '600',
  }
});

export default CartScreen;
