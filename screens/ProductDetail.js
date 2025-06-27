import React, { useState, useEffect } from "react"
import { View, Image, Alert, StyleSheet, ScrollView, SafeAreaView, FlatList } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Text } from "react-native-paper"
import firestore from "@react-native-firebase/firestore"
import { useMyContextProvider } from "../index"
import { useCart } from "../routers/CartContext"
import axios from 'axios'
import API_CONFIG from '../api'
import Icon from 'react-native-vector-icons/Feather';

const normalizeUrl = (base, path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Luôn thêm /storage/ nếu chưa có
    let cleanPath = path;
    if (!cleanPath.startsWith('/storage')) {
        cleanPath = '/storage/' + cleanPath.replace(/^\/?/, '');
    }
    const baseClean = base.endsWith('/') ? base.slice(0, -1) : base;
    return baseClean + cleanPath;
};

const Appointment = ({navigation, route }) => {
    const { id } = route.params || {};
    const [service, setService] = useState(null);
    const [controller] = useMyContextProvider()
    const {userLogin} = controller || {};
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isTextLong, setIsTextLong] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products/${id}`);
                setService(response.data.data || response.data);
                
            } catch (e) {
                setService(null);
                console.log('Lỗi fetchProduct:', e);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products`);
                const products = (response.data.data || response.data)
                    .filter(item => item.id !== id);
                setSimilarProducts(products);
            } catch (e) {
                setSimilarProducts([]);
                console.log('Lỗi lấy sản phẩm tương tự:', e);
            }
        };
        fetchSimilar();
    }, [id]);

    const handleAddToCart = () => {
        if (!service) return;

        const itemToAdd = {
            ...service,
            id: service.id,
            title: service.name,
            price: service.sale_price,
            image: normalizeUrl(API_CONFIG.BASE_URL, service.image_url),
            quantity: quantity,
            note: note,
        };
        
        addToCart(itemToAdd);
        Alert.alert(
            "Thành công",
            "Sản phẩm đã được thêm vào giỏ hàng",
            [{ text: "OK" }]
        );
    };

    //ham hien thi gia tien
    const formatPrice = (price) => {
        if (!price) return "0";
        // Convert to number and check if it ends with .00
        const numPrice = parseFloat(price);
        if (numPrice % 1 === 0) {
            // If it's a whole number (ends with .00), convert to integer
            return Math.floor(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        // If it has decimal places, format normally
        return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                {!service ? (
                    <Text style={{textAlign:'center', fontSize:20, fontWeight:'bold', color:'#FF3B30', marginTop: 50}}>Đang tải...</Text>
                ) : (
                    <>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: normalizeUrl(API_CONFIG.BASE_URL, service.image_url) }} style={styles.mainImage} />
                        </View>
                        
                        <View style={styles.detailsContainer}>
                            <Text style={styles.productName}>{service.name}</Text>
                            <Text style={styles.productPrice}>GIÁ: {formatPrice(service.sale_price)}đ</Text>
                            <View>
                                <Text
                                    style={styles.productDesc}
                                    numberOfLines={isDescriptionExpanded ? undefined : 2}
                                    onTextLayout={(e) => {
                                        if (e.nativeEvent.lines.length > 2 && !isTextLong) {
                                            setIsTextLong(true);
                                        }
                                    }}
                                >
                                    {service.description || 'Không có mô tả.'}
                                </Text>
                                {isTextLong && (
                                    <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                                        <Text style={styles.seeMoreText}>
                                            {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm...'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            <View style={styles.divider} />

                            <View style={styles.similarHeader}>
                                <Text style={styles.label}>SẢN PHẨM TƯƠNG TỰ</Text>
                                <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
                            </View>
                            <FlatList
                                data={similarProducts}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => navigation.push('Appointment', { id: item.id })}
                                        style={styles.similarProductCard}
                                    >
                                        {item.image_url ? (
                                            <View style={styles.similarProductImageContainer}>
                                                <Image
                                                
                                                    source={{ uri: normalizeUrl(API_CONFIG.BASE_URL, item.image_url) }}
                                                    style={styles.similarProductImage}
                                                />
                                            </View>
                                        ) : (
                                            <View style={[styles.similarProductImageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                                                <Text style={{ color: '#999' }}>Không có ảnh</Text>
                                            </View>
                                        )}
                                        <View style={styles.similarProductInfoContainer}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={styles.similarProductTitle}
                                            >
                                                {item.name}
                                            </Text>
                                            <View style={styles.similarProductPriceRow}>
                                                <Text style={styles.similarProductPrice}>
                                                    {formatPrice(item.sale_price)}đ
                                                </Text>
                                                <TouchableOpacity
                                                    style={styles.similarProductAddButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart();
                                                    }}
                                                >
                                                    <Image source={require('../assets/addred.png')} style={styles.similarProductAddIcon} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
            
            {service && (
                <View style={styles.overlayContainer} pointerEvents="box-none">
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <View style={styles.quantityRow}>
                            <View>
                                <Text style={styles.label}>{quantity} sản phẩm</Text>
                                <Text style={styles.totalText}>Tổng: {formatPrice((service?.sale_price || 0) * quantity)}đ</Text>
                            </View>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.quantityButton}>
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                            <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        top: 25,
        left: 20,
        zIndex: 100,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 11,
    },
    backButtonText: {
        fontSize: 32,
        color: '#333',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    imageContainer: {
        width: '100%',
        height: 350,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    detailsContainer: {
        paddingBottom:10,
        paddingLeft:10,
        paddingTop:10,
        paddingRight: 10,
        backgroundColor: '#fff',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 8,
    },
    productDesc: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 5,
    },
    seeMoreText: {
        color: 'black',
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#EAEAEA',
        marginVertical: 16,
    },
    label: {
        fontSize: 16,
        color: '#222',
        fontWeight: 'bold',
    },
    similarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    seeAll: {
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 14,
    },
    similarProductCard: {
        width: 120,
        height: 180,
        backgroundColor: '#FC9907',
        borderWidth: 1,
        borderColor: '#eee',
        marginRight: 12,
        overflow: 'hidden',
        borderRadius: 20,
    },
    similarProductImageContainer: {
        padding: 10,
        width: '100%',
        height: 120,
        backgroundColor: 'white',
        overflow:"hidden",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    similarProductImage: {
        
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        
    },
    similarProductInfoContainer: {
        flex: 1,
        backgroundColor: '#FC9907',
        paddingHorizontal: 8,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    similarProductTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#fff',
        marginBottom: 2,
    },
    similarProductPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    similarProductPrice: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15
    },
    similarProductAddButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    similarProductAddIcon: {
        width: 24,
        height: 24
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingTop: 5,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        borderTopWidth: 1,
        borderColor: '#EAEAEA',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#EF2A39',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 22,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginHorizontal: 16,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
    },
    addToCartButton: {
        height: 60,
        backgroundColor: '#EF2A39',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Appointment;
