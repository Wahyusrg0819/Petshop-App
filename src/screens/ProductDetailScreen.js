import React from 'react';  
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView,  } from 'react-native';  

const ProductDetailScreen = ({ route, navigation }) => {  
    const { product } = route.params;
 

  return (  
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
    <ScrollView contentContainerStyle={styles.container}>  
      {/* Header Section */}  
      <View style={styles.headerContainer}>  
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>  
          <Text style={styles.backButtonText}>
          <Ionicons name="arrow-back" size={25} />
            </Text>  
        </TouchableOpacity>  
        <Text style={styles.headerTitle}>Detail Produk</Text>  
        <TouchableOpacity style={styles.favoriteButton}>  
          <Text style={styles.favoriteButtonText}>♥</Text>  
        </TouchableOpacity>  
      </View>  

      {/* Product Image */}  
      <Image source={{ uri: product.image }} style={styles.productImage} />  

      {/* Product Information */}  
      <View style={styles.productInfoContainer}>  
        <Text style={styles.productTitle}>{product.name}</Text>  
        <Text style={styles.productDescription}>  
          {product.description || 'Tidak ada deskripsi produk yang tersedia.'}  
        </Text>  
        <Text></Text>
        
        <Text style={styles.stockText}>Stock: {product.stock}</Text>
        
        <Text style={styles.productPrice}>{`${product.price}`}</Text>  
      </View>  

      {/* Product Stock */}
      

      {/* Quantity Selector */}  
      <View style={styles.quantityContainer}>  
        <TouchableOpacity style={styles.quantityButton}>  
          <Text style={styles.quantityButtonText}>-</Text>  
        </TouchableOpacity>  
        <Text style={styles.quantityValue}>0</Text>  
        <TouchableOpacity style={styles.quantityButton}>  
          <Text style={styles.quantityButtonText}>+</Text>  
        </TouchableOpacity>  
      </View>  

      {/* Add to Cart Button */}  
      <TouchableOpacity style={styles.addToCartButton}>  
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>  
      </TouchableOpacity>  
    </ScrollView>  
    </SafeAreaView>
  );  
};  

const styles = StyleSheet.create({  
  container: {   
    backgroundColor: '#ffffff',  
    padding: 20,  
  },  
  headerContainer: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'center',  
    marginBottom: 20,  
    paddingHorizontal: 10,
  },  
  backButton: {  
    padding: 10,  
    backgroundColor: '#f5f5f5', // Rounded white button
    borderRadius: 20,
  },  
  backButtonText: {  
    fontSize: 24,  
    color: '#000',  
  },  
  headerTitle: {  
    fontSize: 20,  
    fontWeight: 'bold',  
    color: '#000',  
    textAlign: 'center',  
  },  
  favoriteButton: {  
    padding: 10,  
    backgroundColor: '#f5f5f5', // Rounded white button
    borderRadius: 20,
  },  
  favoriteButtonText: {  
    fontSize: 24,  
    color: '#FF3B30',  
  },  
  productImage: {  
    width: '100%',  
    height: 250,  
    borderRadius: 15,  
    marginBottom: 20,  
    resizeMode: 'contain',  
  },  
  productInfoContainer: {  
    marginBottom: 20,  
    paddingHorizontal: 15,  
  },  
  productTitle: {  
    fontSize: 22,  
    fontWeight: 'bold',  
    marginBottom: 8,  
    color: '#000',  
    textAlign: 'left',
  },  
  productDescription: {  
    fontSize: 14,  
    color: '#777',  
    lineHeight: 22,  
    marginBottom: 12,  
    textAlign: 'justify',
  },  
  productPrice: {  
    fontSize: 22,  
    fontWeight: 'bold',  
    color: '#000',  
    textAlign: 'right',
    marginTop: 10,
  },  
  quantityContainer: {  
    flexDirection: 'row',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginVertical: 20,  
  },  
  quantityButton: {  
    width: 40,  
    height: 40,  
    justifyContent: 'center',  
    alignItems: 'center',  
    backgroundColor: '#f5f5f5',  
    borderRadius: 20,  
    marginHorizontal: 10,  
  },  
  quantityButtonText: {  
    fontSize: 24,  
    color: '#000',  
  },  
  quantityValue: {  
    fontSize: 18,  
    color: '#000',  
  },  
  addToCartButton: {  
    backgroundColor: '#C0EBA6',  
    paddingVertical: 14,  
    borderRadius: 25,  
    alignItems: 'center',  
    marginVertical: 10,  
    marginBottom: 30,
  },  
  addToCartButtonText: {  
    color: '#fff',  
    fontSize: 18,  
    fontWeight: 'bold',  
  },  
});


export default ProductDetailScreen;