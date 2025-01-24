import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const ScheduleScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { userData } = useAuth();
  const API_BASE_URL = 'http://172.20.10.3:5000';

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pricePerDay] = useState(25000);
  const [tax] = useState(2000);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;

    const diffInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (diffInDays <= 0) return 0;

    const subtotal = diffInDays * pricePerDay;
    return subtotal + tax;
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Silakan pilih tanggal mulai dan selesai");
      return;
    }

    if (!userData) {
      Alert.alert("Error", "Silakan login terlebih dahulu");
      return;
    }

    const diffInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const total = calculateTotal();

    const bookingData = {
      user_id: userData.user_id,
      pet_category: category.name,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      duration_days: diffInDays,
      price_per_day: pricePerDay,
      tax: tax,
      total_price: total,
      date: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/pet-boarding/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        navigation.navigate('BookingSuccess', {
          bookingData: {
            ...bookingData,
            booking_id: result.booking_id
          }
        });
      } else {
        Alert.alert("Error", result.message || "Gagal membuat pesanan");
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert("Error", "Terjadi kesalahan saat membuat pesanan");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Jadwal Penitipan - {category.name}</Text>
        </View>

        {/* Date Pickers */}
        <View style={styles.dateSection}>
          <Text style={styles.label}>
            <FontAwesome5 name="calendar-day" size={16} color="#000" /> Tanggal Kedatangan
          </Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {startDate
                ? startDate.toLocaleDateString()
                : "Select Arrival Date"}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setStartDate(selectedDate);
                }
              }}
            />
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>
            <FontAwesome5 name="calendar-alt" size={16} color="#000" /> Tanggal Kepulangan
          </Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>
              {endDate ? endDate.toLocaleDateString() : "Select Departure Date"}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Periode: {" "}
            {startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : "Select dates"}
          </Text>
          <Text style={styles.summaryText}>
            Rp{pricePerDay.toLocaleString()} x {" "}
            {startDate && endDate
              ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
              : 0} {" "}
            days
          </Text>
          <Text style={styles.summaryText}>Tax: Rp{tax.toFixed(2)}</Text>
          <Text style={styles.totalText}>Total: Rp{calculateTotal()}</Text>
        </View>

        {/* Booking Button */}
        <TouchableOpacity style={styles.bookingButton} onPress={handleBooking}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.bookingButtonText}>Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  dateSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  datePicker: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
  summary: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  bookingButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C4F0C5",
    paddingVertical: 15,
    borderRadius: 10,
  },
  bookingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});

export default ScheduleScreen;
