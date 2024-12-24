import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const Header = ({ title, onBackPress, onSearchPress, onNotificationPress }) => {
  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      <View style={styles.rightIcons}>
        {onSearchPress && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <FontAwesome5 name="search" size={20} color="#7a7a7a" />
          </TouchableOpacity>
        )}
        {onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <FontAwesome5 name="bell" size={20} color="#7a7a7a" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    width: 40, // Placeholder untuk menyelaraskan jika tidak ada tombol kembali
  },
});

export default Header;
