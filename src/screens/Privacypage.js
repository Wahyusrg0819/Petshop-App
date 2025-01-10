import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPage = ({ navigation }) => {
  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons 
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
                size={24} 
                color="black" 
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Privasi</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ketentuan Pengguna</Text>
              <Text style={styles.sectionContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis
                hendrerit. Curabitur ut lectus nec orci cursus rhoncus. Donec a ultrices risus. Mauris ut erat ut urna
                rhoncus facilisis a eu neque. Ut iaculis viverra laoreet.
              </Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layanan PawTopia</Text>
              <Text style={styles.sectionContent}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis
                hendrerit. Curabitur ut lectus nec orci cursus rhoncus. Donec a ultrices risus. Mauris ut erat ut urna
                rhoncus facilisis a eu neque. Ut iaculis viverra laoreet.
              </Text>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
});

export default PrivacyPage;
