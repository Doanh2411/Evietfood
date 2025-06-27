import React, { useState, useEffect } from "react";
import { Image, TextInput, View, FlatList, TouchableOpacity, Alert,StyleSheet, ImageBackground, LinearGradient, RefreshControl } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import Swiper from 'react-native-swiper';
import { Dimensions } from 'react-native';
import { useCart } from "../routers/CartContext";
import PostDetail from "./PostDetail";
import { ScrollView } from 'react-native';
import axios from 'axios';
import API_CONFIG from "../api";
import Icon from 'react-native-vector-icons/Feather';

// Thay đổi IP này thành IP LAN của máy tính của bạn
const BASE_URL = API_CONFIG.BASE_URL;
const API_URL = `${BASE_URL}/api/sliders`;
const POSTS_API_URL = `${BASE_URL}/api/posts`;
const CATEGORIES_API_URL = `${BASE_URL}/api/categories`;
const PRODUCTS_API_URL = `${BASE_URL}/api/products`;
const PROMOTIONS_API_URL = `${BASE_URL}/api/promotions`;

// Hàm chuẩn hóa link ảnh
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

const ServicesCustomer = ({ navigation, route }) => {
    const [initialServices, setInitialServices] = useState([]);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [randomServices, setRandomServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { addToCart } = useCart();
    const [banners, setBanners] = useState([]);
    const [postImages, setPostImages] = useState([]);
    const [newsEvents, setNewsEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(API_URL);
            if (response.data.success) {
                const formattedServices = response.data.data.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    title: item.title || '',
                    price: parseFloat(item.price) || 0,
                    image: normalizeUrl(BASE_URL, item.image_url),
                    type: item.categories || 'all',
                    content: item.content || ''
                }));
                
                setServices(formattedServices);
                setInitialServices(formattedServices);

                // Lấy danh sách ảnh banner từ API
                const bannerImages = response.data.data.map(item =>
                    normalizeUrl(BASE_URL, item.image_url)
                ).filter(Boolean);
                setBanners(bannerImages);
            }
        } catch (error) {
            console.error("Error fetching slider data:", error);
        }
    };

    const fetchPostImages = async () => {
        try {
            const response = await axios.get(POSTS_API_URL);
            if (response.data.success) {
                // Lấy danh sách ảnh và title từ các post, chuẩn hóa link ảnh
                const news = response.data.data
                    .map(post => {
                        const img = normalizeUrl(BASE_URL, post.image_url);
                        // Format date, e.g., '20/06/2025'
                        const date = post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : null;
                        return {
                            id: post.id.toString(),
                            title: post.title,
                            image: img,
                            content: post.content || '',
                            date: date,
                        };
                    })
                    .filter(item => item.image); // Chỉ lấy post có ảnh
                setNewsEvents(news);

                // Nếu vẫn muốn lấy riêng mảng ảnh:
                const images = news.map(item => item.image);
                setPostImages(images);
            }
        } catch (error) {
            console.error("Error fetching post images:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(CATEGORIES_API_URL);
            if (response.data.success) {
                const categoryList = response.data.data.map(category => category.name);
                setCategories(categoryList);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(PRODUCTS_API_URL);
            if (response.data.success) {
                const formattedProducts = response.data.data.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    title: item.title || item.name || '',
                    price: parseFloat(item.price) || 0,
                    sale_price: parseFloat(item.sale_price) || parseFloat(item.price) || 0,
                    image: normalizeUrl(BASE_URL, item.image_url),
                    type: item.category?.name || 'all',
                    content: item.description || '',
                    sold: item.sold || 0
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchPromotions = async () => {
        // try {
        //     const response = await axios.get(PROMOTIONS_API_URL);
        //     if (response.data.success) {
        //         const formattedPromotions = response.data.data.map(item => ({
        //             id: item.id,
        //             name: item.name || '',
        //             title: item.title || item.name || '',
        //             price: parseFloat(item.price) || 0,
        //             sale_price: parseFloat(item.sale_price) || parseFloat(item.price) || 0,
        //             image: normalizeUrl(BASE_URL, item.image_url),
        //             type: item.category?.name || 'all',
        //             content: item.description || '',
        //             discount: item.discount || 0,
        //             oldPrice: parseFloat(item.price) || 0
        //         }));
        //         setPromotions(formattedPromotions);
        //     }
        // } catch (error) {
        //     console.error("Error fetching promotions:", error);
        // }
    };

    useEffect(() => {
        fetchData();
        fetchPostImages();
        fetchCategories();
        fetchProducts();
        fetchPromotions();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchData(),
                fetchPostImages(),
                fetchCategories(),
                fetchProducts(),
                fetchPromotions()
            ]);
        } catch (error) {
            console.error("Error during refresh:", error);
        }
        setRefreshing(false);
    };

    //ham hien thi gia tien
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0';
        // Convert to number and check if it ends with .00
        const numPrice = parseFloat(price);
        if (numPrice % 1 === 0) {
            // If it's a whole number (ends with .00), convert to integer
            return Math.floor(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        // If it has decimal places, format normally
        return numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const [name, setName] = useState('')
    const handleAppointment = (item) => {
        navigation.navigate('ProductDetail', { id: item.id });
    };

    const handleOrder = (item) => {
        const orderItem = {
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: 1,
            image: item.image
        };
        
        addToCart(orderItem);
        Alert.alert(
            "Thành công",
            "Sản phẩm đã được thêm vào giỏ hàng",
            [{ text: "OK" }]
        );
    };

    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setServices(initialServices);
        } else {
            const result = initialServices.filter(service => service.type === category);
            setServices(result);
        }
    };

    
    
    const randomitem = ({ item }) => {
        if (randomServices.length === 2) {
            // Đảm bảo giá trị hợp lệ trước khi chuyển đổi
            const price1 = typeof randomServices[0].price === 'number' ? 
                randomServices[0].price : 
                parseInt(randomServices[0].price?.toString().replace(/\./g, '') || '0');
                
            const price2 = typeof randomServices[1].price === 'number' ? 
                randomServices[1].price : 
                parseInt(randomServices[1].price?.toString().replace(/\./g, '') || '0');
                
            const totalPrice = price1 + price2;
            const discountAmount = 5000;
            const finalPrice = totalPrice - discountAmount;
            
            return (
                <View style={styles.comboContainer}>
                    <TouchableOpacity 
                        style={styles.recommendedCard}
                    >
                        <View style={styles.comboImagesContainer}>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: randomServices[0].image }}
                                    style={styles.comboImage}
                                    resizeMode="cover"
                                />
                                <Image
                                    source={{ uri: randomServices[1].image }}
                                    style={styles.comboImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                        <View style={styles.recommendedOverlay}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.originalPrice}>{formatPrice(totalPrice)}đ</Text>
                                <Text style={styles.finalPrice}>{formatPrice(finalPrice)}đ</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.orderButton}
                                onPress={() => {
                                    // Tạo một sản phẩm combo mới
                                    const comboProduct = {
                                        id: 'combo-' + Date.now(),
                                        title: `Combo ${randomServices[0].title} + ${randomServices[1].title}`,
                                        price: finalPrice,
                                        quantity: 1,
                                        image: randomServices[0].image // Dùng ảnh của sản phẩm đầu tiên
                                    };
                                    addToCart(comboProduct);
                                    Alert.alert(
                                        "Thành công",
                                        "Combo đã được thêm vào giỏ hàng",
                                        [{ text: "OK" }]
                                    );
                                }}
                            >
                                <Text style={styles.orderButtonText}>Đặt ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };
    

    useEffect(() => {
        const fetchCategories = async () => {
            const categorySnapshot = await firestore().collection('Type').get();
            const categoryList = categorySnapshot.docs.map(doc => doc.data().type); // Assuming 'type' is the field name
            setCategories(categoryList);
           
        };

        fetchCategories();
    }, []);
    
    const data = {
        banners: banners,
        services,
        categories,
        randomServices,
        selectedCategory,
    };

    // Thêm các hàm lọc dữ liệu cho các section
    const getPromotions = () => {
        return promotions;
    };
    const getBestSellers = () => {
        // Sử dụng products từ API thay vì initialServices
        if (products.some(p => p.sold)) {
            return [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
        }
        return products.slice(0, 3);
    };
    const getRecommended = () => {
        // Lấy tất cả sản phẩm từ products API
        return products;
    };

    return (
        <FlatList
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#FF3B30']}
                    tintColor="#FF3B30"
                />
            }
            ListHeaderComponent={
                <>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 8}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={require('../assets/canhcut.jpg')} style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}} />
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>Mr Van</Text>
                        </View>
                        <Image source={require('../assets/bell.png')} style={{width: 28, height: 28}} />
                    </View>
                    <View style={styles.searchContainer}>
                        <Image 
                            source={require('../assets/search.png')}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            value={name}
                            placeholder="Tìm kiếm"
                            placeholderTextColor="#000000"
                            style={styles.inputContainerStyle}
                            onChangeText={(text) => {
                                setName(text);
                                const result = initialServices.filter(service => service.title.toLowerCase().includes(text.toLowerCase()));
                                setServices(result);
                            }}
                        />
                    </View>
                    <View style={{height: 220, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden'}}>
                        {banners && banners.length > 0 && (
                            <Swiper
                                key={banners.length}
                                height={220}
                                autoplay
                                autoplayTimeout={4}
                                showsPagination
                                dotColor={'#fff'}
                                activeDotColor={'#FF3B30'}
                                paginationStyle={{
                                    bottom: 10
                                }}
                                loop
                            >
                                {banners.map((item, index) => (
                                    <View 
                                        key={index} 
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: '#fff',
                                        }}
                                    >
                                        <Image 
                                            source={{ uri: item }} 
                                            style={{
                                                width: '100%',
                                                height: 220,
                                            }}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ))}
                            </Swiper>
                        )}
                    </View>
                    <View style={{marginHorizontal: 16, marginBottom: 16}}>
                        <FlatList
                            data={['Tất cả', ...categories]}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === item && styles.categoryButtonActive
                                    ]}
                                    onPress={() => filterByCategory(item)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        selectedCategory === item && styles.buttonTextActive
                                    ]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{paddingRight: 16}}
                        />
                    </View>
                    <View style={{marginTop: 16}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#FF3B30'}}>CHƯƠNG TRÌNH KHUYẾN MÃI</Text>
                            <TouchableOpacity><Text style={{color: 'orange'}}>Xem tất cả</Text></TouchableOpacity>
                        </View>
                        <FlatList
                            data={getPromotions()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            style={{paddingLeft: 16, marginTop: 8}}
                            renderItem={({item}) => (
                                <View style={{width: 160, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#FF3B30'}}>
                                    <Image source={{uri: item.image}} style={{width: 80, height: 80, borderRadius: 8, alignSelf: 'center'}} />
                                    <Text style={{color: '#FF3B30', fontWeight: 'bold', marginTop: 5}}>Giảm {item.discount || (item.oldPrice ? (item.oldPrice - item.price) : 0)}k</Text>
                                    <Text numberOfLines={2} style={{fontWeight: 'bold', marginTop: 5}}>{item.title}</Text>
                                    <Text style={{color: '#888', textDecorationLine: 'line-through'}}>{item.oldPrice ? formatPrice(item.oldPrice) + 'đ' : ''}</Text>
                                    <Text style={{color: '#FF3B30', fontWeight: 'bold'}}>{formatPrice(item.price)}đ</Text>
                                </View>
                            )}
                        />
                    </View>

                    <View style={{marginTop: 16}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold'}}>SẢN PHẨM BÁN CHẠY</Text>
                            <TouchableOpacity><Text style={{color: 'orange'}}>Xem tất cả</Text></TouchableOpacity>
                        </View>
                        <FlatList
                            data={getBestSellers()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            style={{paddingLeft: 16, marginTop: 8}}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleAppointment(item)}
                                    style={{
                                        width: 170,
                                        height: 220,
                                        backgroundColor: '#FC9907',
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        marginRight: 12,
                                        overflow: 'hidden',
                                        borderBottomLeftRadius: 20,
                                        borderBottomRightRadius: 20,
                                        borderTopLeftRadius: 20,
                                        borderTopRightRadius: 20,
                                    }}
                                >
                                    {item.image ? (
                                        <View style={{
                                            width: '100%',
                                            height: 160,
                                            backgroundColor: 'white',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow:"hidden",
                                            borderBottomLeftRadius: 20,
                                            borderBottomRightRadius: 20,
                                            padding: 10,
                                        }}>
                                            <Image
                                                source={{uri: item.image}}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    resizeMode: 'cover',
                                                }}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{
                                            width: '100%',
                                            height: 160,
                                            backgroundColor: 'white',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ color: '#999' }}>Không có ảnh</Text>
                                        </View>
                                    )}
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: '#FC9907',
                                        borderBottomLeftRadius: 20,
                                        borderBottomRightRadius: 20,
                                        paddingHorizontal: 8,
                                        paddingVertical: 8,
                                        justifyContent: 'center',
                                    }}>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 14,
                                                color: '#fff',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>
                                                {formatPrice(item.sale_price)}đ
                                            </Text>
                                            <TouchableOpacity
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 14,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleOrder(item);
                                                }}
                                            >
                                                <Image source={require('../assets/addred.png')} style={{width: 24, height: 24}} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={{marginTop: 16}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold'}}>DÀNH CHO BẠN</Text>
                            <TouchableOpacity><Text style={{color: 'orange'}}>Xem tất cả</Text></TouchableOpacity>
                        </View>
                        <FlatList
                            data={getRecommended()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            style={{paddingLeft: 16, marginTop: 8}}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleAppointment(item)}
                                    style={{
                                        width: 170,
                                        height: 220,
                                        borderRadius: 20,
                                        backgroundColor: '#FC9907',
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        marginRight: 12,
                                        overflow: 'hidden',
                                    }}
                                >
                                    {item.image ? (
                                        <View style={{
                                            width: '100%',
                                            height: 160,
                                            backgroundColor: 'white',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow:"hidden",
                                            borderBottomLeftRadius: 20,
                                            borderBottomRightRadius: 20,
                                            padding: 10,
                                        }}>
                                            <Image
                                                source={{uri: item.image}}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    resizeMode: 'cover',
                                                }}
                                            />
                                        </View>
                                    ) : (
                                        <View style={{
                                            width: '100%',
                                            height: 160,
                                            backgroundColor: 'white',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ color: '#999' }}>Không có ảnh</Text>
                                        </View>
                                    )}
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: '#FC9907',
                                        borderBottomLeftRadius: 20,
                                        borderBottomRightRadius: 20,
                                        paddingHorizontal: 8,
                                        paddingVertical: 8,
                                        justifyContent: 'center',
                                    }}>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 14,
                                                color: '#fff',
                                                marginBottom: 2,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>
                                                {formatPrice(item.sale_price)}đ
                                            </Text>
                                            <TouchableOpacity
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 14,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleOrder(item);
                                                }}
                                            >
                                                <Image source={require('../assets/addred.png')} style={{width: 24, height: 24}} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={{marginTop: 16}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold'}}>TIN TỨC - SỰ KIỆN</Text>
                            <TouchableOpacity><Text style={{color: '#FF3B30'}}>Xem tất cả</Text></TouchableOpacity>
                        </View>
                        <FlatList
                            data={newsEvents}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            style={{paddingLeft: 16, marginTop: 8, paddingBottom: 16}}
                            renderItem={({item}) => (
                                <TouchableOpacity 
                                    style={styles.newsCard}
                                    onPress={() => navigation.navigate('PostDetail', { id: item.id })}
                                >
                                    <View style={styles.newsImageContainer}>
                                        <Image
                                            source={{uri: item.image}}
                                            style={styles.newsImage}
                                        />
                                    </View>
                                    <View style={styles.newsContent}>
                                        <View style={styles.newsTagContainer}>
                                            <Text style={styles.newsTagText}>TIN TỨC & SỰ KIỆN</Text>
                                        </View>
                                        <Text numberOfLines={1} style={styles.newsTitle}>{item.content}</Text>
                                        
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    

                    
                </>
            }
            />
            
    );
};
const styles = StyleSheet.create({
    
    flatmain: {
        backgroundColor: '#F8F9FA',
    },
    Viewimg: {
        paddingLeft:15,
        justifyContent:"center", 
        alignSelf:"center",
        
    },
    
    imagerandom: {
        width: 155,
        height: 98,
        borderRadius: 13,
        borderWidth: 0.5,
        borderColor: 'white',
    },
    
    viewrandom: {
        width: 158,
        height: 105,
        borderRadius: 15,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagerender: {
        width: 150,
        height: 100,
        borderRadius: 15,
        borderWidth: 0,
    },
    
    viewrender: {
        width: 130,
        height: 95,
        borderRadius: 12,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    
    bannerSlide: {
        width: '90%',
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
        marginBottom: 160,
        
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        tintColor: '#000000',
    },
    inputContainerStyle: {
        flex: 1,
        color: '#000000',
        fontSize: 16,
        paddingVertical: 8,
    },
    bannerImage: {
        width: '100%',
        height: 180,
        borderRadius: 0,
    },
    buttonContainer: {
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: 'white',
        borderRadius: 20, // Để tạo hình tròn
        padding: 3, // Thêm khoảng cách bên trong
    },
    categoryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginRight: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    categoryButtonActive: {
        backgroundColor: 'orange',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666666',
    },
    buttonTextActive: {
        color: '#FFFFFF',
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
        borderRadius: 10,
    },
    recommendedSection: {
        marginVertical: 16,
    },
    recommendedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    recommendedHeaderText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    
    comboImagesContainer: {
        width: '100%',
        height: '100%',
    },
    imageWrapper: {
        flexDirection: 'row',
        height: '100%',
    },
    comboImage: {
        width: '50%',
        height: '100%',
    },
    recommendedOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    originalPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    finalPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFD700',
    },
    discountTag: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FF3B30',
    },
    orderButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    orderButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    
    productImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#F8F8F8',
    },
    productContent: {
        padding: 16,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
        lineHeight: 22,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FF3B30',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    bannerContainer: {
        marginBottom: 16,
    },
    divider: {
        height: 8,
        backgroundColor: '#F0F0F0',
    },
    comboContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    newsCard: {
        width: 150,
        marginRight: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    newsImageContainer: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    newsImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    newsTagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#ED7020',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    newsTagText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    newsContent: {
        padding: 8,
    },
    newsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2E2E2E',
        marginBottom: 8,
        minHeight: 15,
    },
    newsDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newsDateText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#888',
    },
});
export default ServicesCustomer;
