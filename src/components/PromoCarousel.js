import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';


const { width } = Dimensions.get('window');

const promos = [
  {
    title: 'Royal Canin Adult Pomeranian',
    description: 'Dapatkan promo menarak disini, tanpa syarat',
    image: require('../assets/images/image.png'), // Ganti dengan URL gambar produk
  },
    {
    title: 'Royal Canin Adult Persian',
    description: 'Dapatkan promo menarik disini, tanpa syarat',
    image: require('../assets/images/image.png'), // Ganti dengan URL gambar produk
  },
  // Tambahkan produk lainnya di sini
];

const PromoCarousel = () => {
  const renderItem = ({ item }) => (
    <View style={styles.promoCard}>
      <Image source={item.image } style={styles.promoImage} />
      <View style={styles.textContainer}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <Carousel
      loop
      width={width}
      height={200}
      autoPlay={true}
      data={promos}
      scrollAnimationDuration={2000}
      autoPlayInterval={5000}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9D9',
    paddingHorizontal: 15,
    paddingVertical: 1,
    borderRadius: 20,
    marginHorizontal: 15,
    right: 10,
    top: 10,
  },
  promoImage: {
    width: 120,
    height: 150,
    resizeMode: 'contain',
    elevation: 200,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 2, height: 5 },
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  promoDescription: {
    fontSize: 14,
    color: '#7A7A7A',
  },
});

export default PromoCarousel;
