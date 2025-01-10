import React, { useState, useEffect, useRef } from 'react';  
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert, Linking, Platform, StatusBar, Animated } from 'react-native';  
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import FloatingNotification from '../components/FloatingNotification';
import { CommonActions } from '@react-navigation/native';
import { ProductDetailHeader } from '../components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProductDetailScreen = ({ route, navigation }) => {  
    const insets = useSafeAreaInsets();
    const { product } = route.params;
    const { userData } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [showNotification, setShowNotification] = useState(false);
    const [showFavoriteNotification, setShowFavoriteNotification] = useState(false);
    const [favoriteMessage, setFavoriteMessage] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;

    // Tambahkan useEffect untuk mengecek status favorit
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!userData?.user_id) return;
            
            try {
                const response = await fetch(`http://172.20.10.3:5000/api/favorites/${userData.user_id}`);
                const data = await response.json();
                
                // Jika response 404 atau data kosong, berarti tidak ada favorit
                if (!data || response.status === 404) {
                    setIsFavorite(false);
                    return;
                }

                // Pastikan data adalah array sebelum menggunakan some
                const favorites = Array.isArray(data) ? data : [];
                
                // Cek apakah produk ini ada di daftar favorit
                const productIdToCheck = product.product_id || product.id;
                const isProductFavorited = favorites.some(fav => 
                    fav.product_id === productIdToCheck || 
                    fav.product_id === parseInt(productIdToCheck)
                );

                setIsFavorite(isProductFavorited);
            } catch (error) {
                // Jika error 404, berarti tidak ada favorit
                if (error.response?.status === 404) {
                    setIsFavorite(false);
                } else {
                    console.log('Error checking favorite status:', error.message);
                }
            }
        };

        checkFavoriteStatus();
    }, [userData, product]);

    // Tambahkan fungsi untuk menutup notifikasi
    const handleHideNotification = () => {
        setShowNotification(false);
    };

    const handleHideFavoriteNotification = () => {
        setShowFavoriteNotification(false);
    };

    const handleToggleFavorite = async () => {
        if (!userData || !userData.user_id) {
            Alert.alert('Error', 'Silakan login terlebih dahulu');
            return;
        }

        try {
            const endpoint = isFavorite 
                ? 'http://172.20.10.3:5000/api/favorites/removeFavorite'
                : 'http://172.20.10.3:5000/api/favorites/addFavorite';

            // Gunakan product_id atau id sesuai dengan struktur data yang ada
            const productIdToUse = product.product_id || product.id;

            const response = await fetch(endpoint, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userData.user_id,
                    product_id: productIdToUse
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsFavorite(!isFavorite);
                setFavoriteMessage(isFavorite ? 'Produk dihapus dari favorit' : 'Produk ditambahkan ke favorit');
                setShowFavoriteNotification(true);
            } else {
                Alert.alert('Error', data.message || 'Gagal mengubah status favorit');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    // Fungsi untuk menambahkan produk ke keranjang
    const handleAddToCart = async () => {
        if (!userData || !userData.user_id) {
            Alert.alert('Error', 'User not logged in. Please login to continue.');
            return;
        }

        try {
            const payload = {
                user_id: userData.user_id,
                product_id: product.id,
                productPict: product.image,
                quantity: quantity,
                price: product.price,
            };

            const response = await fetch('http://172.20.10.3:5000/api/addcart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setShowNotification(true);
            } else {
                Alert.alert('Error', data.message || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    

    // Fungsi untuk mengubah kuantitas
    const handleQuantityChange = (type) => {
        if (type === 'increment') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleWhatsApp = async () => {
        // Format pesan dengan menambahkan ID produk
        const message = `Halo, saya ingin bertanya tentang produk:\n\nID: ${product.id}\nNama: ${product.name}\nHarga: Rp ${product.price.toLocaleString('id-ID')}\n\nMohon informasi lebih lanjut.`;
        
        // Gunakan format URL yang berbeda untuk Android dan iOS
        let whatsappUrl;
        if (Platform.OS === 'android') {
            whatsappUrl = `whatsapp://send?phone=+6285763304788&text=${encodeURIComponent(message)}`;
        } else {
            whatsappUrl = `https://api.whatsapp.com/send?phone=+6285763304788&text=${encodeURIComponent(message)}`;
        }
        
        try {
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
            } else {
                // Coba URL alternatif jika yang pertama gagal
                const alternativeUrl = `https://wa.me/6285763304788?text=${encodeURIComponent(message)}`;
                const canOpenAlternative = await Linking.canOpenURL(alternativeUrl);
                
                if (canOpenAlternative) {
                    await Linking.openURL(alternativeUrl);
                } else {
                    Alert.alert(
                        'Error',
                        'Tidak dapat membuka WhatsApp. Pastikan WhatsApp terinstall di perangkat Anda',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('WhatsApp error:', error);
            Alert.alert(
                'Error',
                'Tidak dapat membuka WhatsApp. Silakan coba lagi.',
                [{ text: 'OK' }]
            );
        }
    };

    return (  
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />
            <FloatingNotification
                visible={showNotification}
                message="Produk berhasil ditambahkan ke keranjang!"
                onHide={handleHideNotification}
            />
            <FloatingNotification
                visible={showFavoriteNotification}
                message={favoriteMessage}
                onHide={handleHideFavoriteNotification}
            />
            <SafeAreaView style={[styles.safeArea, { paddingTop: 0 }]}>
                <ProductDetailHeader 
                    onBackPress={() => navigation.goBack()}
                    onFavoritePress={handleToggleFavorite}
                    isFavorite={isFavorite}
                    scrollY={scrollY}
                />

                <Animated.ScrollView 
                    style={[
                        styles.mainContainer,
                        {
                            paddingTop: Platform.OS === 'ios' ? 0 + insets.top : 0 + StatusBar.currentHeight,
                        }
                    ]}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={styles.container}>
                        <View style={styles.productImageContainer}>
                            <Image source={{ uri: product.image }} style={styles.productImage} />  
                        </View>
                        {/* Product Information */}  
                        <View style={styles.productInfoContainer}>  
                            <Text style={styles.productTitle}>{product.name}</Text>  
                            <Text style={styles.productDescription}>
                                {product.description || 'No description available'}
                            </Text>
                            <Text style={styles.stockText}>Stock: {product.stock}</Text>
                             
                        </View>  

                        {/* Quantity Selector */}  
                        <View style={styles.quantityContainer}>
                            <View style={styles.leftContainer}>
                                <TouchableOpacity 
                                    style={styles.quantityButton} 
                                    onPress={() => handleQuantityChange('decrement')}
                                >
                                    <Ionicons name="remove" size={25} />
                                </TouchableOpacity>  
                                <Text style={styles.quantityValue}>{quantity}</Text>  
                                <TouchableOpacity 
                                    style={styles.quantityButton} 
                                    onPress={() => handleQuantityChange('increment')}
                                >
                                    <Ionicons name="add" size={25} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.rightContainer}>
                                <Text style={styles.productPrice}>Rp {product.price.toLocaleString('id-ID')}</Text>
                            </View>
                        </View>

                        {/* Buttons Container */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity 
                                style={styles.whatsappButton}
                                onPress={handleWhatsApp}
                            >
                                <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                                <Text style={styles.whatsappButtonText}>Chat</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.addToCartButton} 
                                onPress={handleAddToCart}
                            >  
                                <Text style={styles.addToCartButtonText}>Add to Cart</Text>  
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.ScrollView>
            </SafeAreaView>
        </>
    );  
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    mainContainer: {
        flex: 1,
    },
    container: { 
        backgroundColor: '#ffffff', 
        flex: 0,
        paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
    },
    productImageContainer: { 
        width: '100%',
        height: Platform.OS === 'android' ? 350 : 400,
        justifyContent: 'center', 
        alignItems: 'center',
        marginBottom: 0,
        backgroundColor: '#ffffff',
        paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
    },
    productImage: { 
        width: '100%', 
        height: '90%',
        resizeMode: 'cover',
        borderRadius: 24,
    },
    productInfoContainer: { 
        marginBottom: Platform.OS === 'android' ? 16 : 20 
    },
    productTitle: { 
        fontSize: Platform.OS === 'android' ? 20 : 22, 
        fontWeight: 'bold', 
        marginBottom: Platform.OS === 'android' ? 6 : 8 
    },
    productDescription: { 
        fontSize: Platform.OS === 'android' ? 13 : 14, 
        color: '#777', 
        lineHeight: Platform.OS === 'android' ? 20 : 22, 
        marginBottom: Platform.OS === 'android' ? 10 : 12 
    },
    stockText: { 
        fontSize: Platform.OS === 'android' ? 14 : 16, 
        color: '#333', 
        marginBottom: Platform.OS === 'android' ? 8 : 10 
    },
    productPrice: { 
        fontSize: Platform.OS === 'android' ? 20 : 22, 
        fontWeight: 'bold', 
        color: '#C0EBA6', 
        marginTop: Platform.OS === 'android' ? 8 : 10 
    },
    quantityContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginVertical: Platform.OS === 'android' ? 16 : 20 
    },
    leftContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5', 
        borderRadius: 20, 
        paddingHorizontal: 1 
    },
    rightContainer: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    quantityButton: { 
        width: Platform.OS === 'android' ? 35 : 40, 
        height: Platform.OS === 'android' ? 35 : 40, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    quantityButtonText: { 
        fontSize: Platform.OS === 'android' ? 22 : 24, 
        color: '#000' 
    },
    quantityValue: { 
        fontSize: Platform.OS === 'android' ? 16 : 18, 
        paddingHorizontal: Platform.OS === 'android' ? 2 : 3, 
        paddingVertical: Platform.OS === 'android' ? 8 : 10 
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: Platform.OS === 'android' ? 8 : 10,
        marginVertical: Platform.OS === 'android' ? 8 : 10,
        paddingBottom: Platform.OS === 'android' ? 10 : 20,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
        paddingVertical: Platform.OS === 'android' ? 12 : 14,
        paddingHorizontal: Platform.OS === 'android' ? 12 : 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 0.8,
    },
    whatsappButtonText: {
        color: '#fff',
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    addToCartButton: {
        backgroundColor: '#C0EBA6',
        paddingVertical: Platform.OS === 'android' ? 14 : 16,
        borderRadius: 25,
        alignItems: 'center',
        flex: 2.2,
    },
    addToCartButtonText: {
        color: '#fff',
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default ProductDetailScreen;
