import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomTabs' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.timeText}>9:41</Text>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Pembayaran Berhasil!</Text>
        <Text style={styles.subtitle}>
          pesanan Anda sedang disiapkan oleh toko, kurir akan mengirimkannya ke alamat Anda
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleGoHome}>
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 16,
    color: "#000",
    marginTop: 10,
  },
  content: {
    marginTop: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#808080",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#B5E6A1",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default PaymentSuccessScreen;
