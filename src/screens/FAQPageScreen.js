import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQPageScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);

  const faqData = [
    { id: 1, title: 'keamanan', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis hendrerit. Curabitur ut lectus nec orci cursus rhoncus.' },
    { id: 2, title: 'keamanan', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis hendrerit. Curabitur ut lectus nec orci cursus rhoncus.' },
    { id: 3, title: 'keamanan', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis hendrerit. Curabitur ut lectus nec orci cursus rhoncus.' },
    { id: 4, title: 'keamanan', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis hendrerit. Curabitur ut lectus nec orci cursus rhoncus.' },
    { id: 5, title: 'keamanan', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris interdum sapien sodales mi sagittis hendrerit. Curabitur ut lectus nec orci cursus rhoncus.' },
  ];

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

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
            <Text style={styles.headerText}>FAQ</Text>
            <View style={styles.rightHeaderPlaceholder} />
          </View>

          {/* FAQ List */}
          <FlatList
            data={faqData}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => (
              <View style={styles.faqItem}>
                <TouchableOpacity style={styles.faqHeader} onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.faqTitle}>{item.title}</Text>
                  <Ionicons
                    name={expanded === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#000"
                  />
                </TouchableOpacity>
                {expanded === item.id && <Text style={styles.faqContent}>{item.content}</Text>}
              </View>
            )}
          />
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
  content: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  faqItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  faqContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    paddingVertical: 5,
  },
});

export default FAQPageScreen;
