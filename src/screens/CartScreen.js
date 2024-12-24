import React, { useEffect, useState } from "react";
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
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { Swipeable } from "react-native-gesture-handler";

const CartScreen = () => {
  const [cart, setCart] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [taxRate] = useState(0.12); // 12% tax
  const { userData } = useAuth();

  const fetchCartData = async () => {
    if (!userData || !userData.user_id) {
      Alert.alert("Error", "User ID not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://172.20.10.2:5000/api/view/${userData.user_id}`
      );
      const data = await response.json();

      if (response.ok) {
        setCart(data.cart || []);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch cart data");
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      Alert.alert("Error", "An unexpected error occurred while fetching cart data");
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [userData]);

  const handleRemoveFromCart = async (cart_id) => {
    try {
      const response = await fetch(
        `http://172.20.10.2:5000/api/delete/${cart_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Product removed from cart");
        setCart((prevCart) => prevCart.filter((item) => item.cart_id !== cart_id));
      } else {
        Alert.alert("Error", data.message || "Failed to remove product from cart");
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      Alert.alert("Error", "An unexpected error occurred while removing product");
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
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
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
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
        <Animated.View style={{ transform: [{ scale }] }}>
          <FontAwesome5 name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCartItem = ({ item }) => {
    const isSelected = selectedProductIds.includes(item.cart_id);

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.cart_id)
        }
      >
        <TouchableOpacity
          style={[styles.cartItem, isSelected && styles.selectedItem]}
          onPress={() => handleSelectProduct(item.cart_id)}
        >
          <Image
            source={{ uri: item.productPict }}
            style={styles.cartItemImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productDescription}>
              Untuk {item.product_description}
            </Text>
            <Text style={styles.productPrice}>
              Rp{parseFloat(item.price).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderCheckout = () => {
    const { subtotal, tax, total } = calculateTotal();

    return (
      <View style={styles.checkoutContainer}>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutText}>Subtotal:</Text>
          <Text style={styles.checkoutText}>Rp{subtotal}</Text>
        </View>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutText}>Tax:</Text>
          <Text style={styles.checkoutText}>Rp{tax}</Text>
        </View>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutTotalText}>Totals:</Text>
          <Text style={styles.checkoutTotalText}>Rp{total}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={styles.Container}>
      <Text style={styles.header}>Keranjang</Text>
      {cart.length > 0 ? (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.cart_id.toString()}
          />
          {renderCheckout()}
        </>
      ) : (
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cartList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productDescription: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 4,
  },
  deleteAction: {
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginVertical: 8,
    borderRadius: 12,
  },
  checkoutContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 96,
  },
  checkoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  checkoutLabel: {
    fontSize: 14,
    color: "#888",
  },
  checkoutValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  checkoutTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C0EBA6",
  },
  checkoutButton: {
    backgroundColor: "#C0EBA6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  checkoutContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: "fixed",
  },
  checkoutSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  checkoutText: {
    fontSize: 14,
    color: "#888",
  },
  checkoutTotalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyCartText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CartScreen;
