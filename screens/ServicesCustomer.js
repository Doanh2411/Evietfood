import React, { useState, useEffect } from "react";
import { Image, TextInput, View, FlatList, TouchableOpacity, Alert,StyleSheet, ImageBackground, LinearGradient } from "react-native";
import { IconButton, Text } from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { Dimensions } from 'react-native';
import { useCart } from "../routers/CartContext";

import { ScrollView } from 'react-native';


const ServicesCustomer = ({ navigation, route }) => {
    
    const [initialServices, setInitialServices] = useState([]);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]); // State to hold categories
    const [randomServices, setRandomServices] = useState([]); // Thêm state mới
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { addToCart } = useCart();

    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setServices(initialServices); // Hiển thị tất cả sản phẩm
        } else {
            const result = initialServices.filter(service => service.type === category);
            setServices(result);
            
        }
    };
  
    useEffect(() => {
        const unsubscribe = firestore()
            .collection('Services')
            .onSnapshot(querySnapshot => {
                const services = [];
                querySnapshot.forEach(documentSnapshot => {
                    services.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id,
                    });
                });
                setServices(services);
                setInitialServices(services);
                
                // Lấy 2 sản phẩm ngẫu nhiên cho combo
                if (services.length >= 2) {
                    const shuffled = [...services].sort(() => 0.5 - Math.random());
                    setRandomServices(shuffled.slice(0, 2));
                }
            });

        return () => unsubscribe();
    }, []);
    //ham hien thi gia tien
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const [name, setName] = useState('')
    const handleAppointment = (item) => {
        navigation.navigate('Information', { selectedService: item });
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

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleAppointment(item)} style={styles.productCard}>
            <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productContent}>
                <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}đ</Text>
                    <TouchableOpacity 
                        style={styles.orderButton}
                        onPress={() => handleOrder(item)}
                    >
                        <Text style={styles.orderButtonText}>Đặt ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
    
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
    
    const bannerImages = [
        require("../assets/banner2.png"), // Sử dụng banner2 làm ảnh đầu tiên
        require("../assets/banner2.png"), // Sử dụng banner2 làm ảnh thứ hai
    ];

    // Thêm các hàm lọc dữ liệu cho các section
    const getPromotions = () => {
        // Giả sử có trường discount hoặc tự tính nếu có giá gốc và giá giảm
        return initialServices.filter(s => s.discount || s.oldPrice);
    };
    const getBestSellers = () => {
        // Giả sử có trường sold, nếu không có thì lấy 3 sản phẩm đầu tiên
        if (initialServices.some(s => s.sold)) {
            return [...initialServices].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3);
        }
        return initialServices.slice(0, 3);
    };
    const getRecommended = () => {
        // Lấy 3 sản phẩm ngẫu nhiên
        return [...initialServices].sort(() => 0.5 - Math.random()).slice(0, 3);
    };
    const newsEvents = [
        {
            id: '1',
            title: 'Khách hàng khi đặt hàng đồng thời cùng gói khuyến mãi sẽ được giảm 20%',
            image: initialServices[0]?.image,
        },
        {
            id: '2',
            title: 'Khách hàng khi đặt hàng đồng thời cùng gói khuyến mãi sẽ được giảm 20%',
            image: initialServices[1]?.image,
        },
        {
            id: '3',
            title: 'Khách hàng khi đặt hàng đồng thời cùng gói khuyến mãi sẽ được giảm 20%',
            image: initialServices[2]?.image,
        },
    ];

    return (
        <FlatList
            ListHeaderComponent={
                <>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 8}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={require('../assets/padlock.png')} style={{width: 40, height: 40, borderRadius: 20, marginRight: 10}} />
                            <Text style={{fontWeight: 'bold', fontSize: 16}}>Mr Van</Text>
                        </View>
                        <Image source={require('../assets/bell.png')} style={{width: 28, height: 28}} />
                    </View>
                    <View style={{paddingHorizontal: 16, marginBottom: 8, alignItems: 'center'}}>
                        <TextInput
                            value={name}
                            placeholder="Tìm kiếm"
                            style={styles.inputContainerStyle}
                            onChangeText={(text) => {
                                setName(text);
                                const result = initialServices.filter(service => service.title.toLowerCase().includes(text.toLowerCase()));
                                setServices(result);
                            }}
                        />
                    </View>
                    <View style={{marginHorizontal: 16, marginBottom: 16}}>
                        <SwiperFlatList
                            autoplay
                            autoplayDelay={3}
                            autoplayLoop
                            index={0}
                            showPagination
                            data={bannerImages}
                            horizontal={true}
                            snapToInterval={Dimensions.get('window').width - 32}
                            decelerationRate="fast"
                            style={{ height: 220, borderRadius: 12, overflow: 'hidden' }}
                            renderItem={({ item }) => (
                                <View style={{width: Dimensions.get('window').width - 32, height: 220, justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={item} style={{width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover'}} />
                                </View>
                            )}
                            paginationStyleItem={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginHorizontal: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.2)'
                            }}
                            paginationStyleItemActive={{
                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                            }}
                        />
                    </View>
                    <View style={{flexDirection: 'row', marginHorizontal: 16, marginBottom: 16}}>
                        {['Tất cả', 'Combos', 'Ăn vặt', 'Đồ uống'].map((tab, idx) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === tab && styles.categoryButtonActive
                                ]}
                                onPress={() => filterByCategory(tab)}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    selectedCategory === tab && styles.buttonTextActive
                                ]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
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
                                    onPress={() => navigation.navigate('Appointment', { service: item })}
                                    style={{
                                        width: 140,
                                        height: 180,
                                        borderRadius: 12,
                                        backgroundColor: 'orange',
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        marginRight: 12,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Image
                                        source={{uri: item.image}}
                                        style={{
                                            width: '100%',
                                            height: 125,
                                            borderTopLeftRadius: 15,
                                            borderTopRightRadius: 15,
                                            backgroundColor: 'orange',
                                            borderBottomLeftRadius: 15,
                                            borderBottomRightRadius: 15,
                                            resizeMode: 'cover',
                                        }}
                                    />
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: 'orange',
                                        borderBottomLeftRadius: 12,
                                        borderBottomRightRadius: 12,
                                        paddingHorizontal: 8,
                                        paddingVertical: 8,
                                        justifyContent: 'center',
                                    }}>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 13,
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
                                            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>
                                                {formatPrice(item.price)}đ
                                            </Text>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#FF3B30',
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
                                                <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>+</Text>
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
                                    onPress={() => navigation.navigate('Appointment', { service: item })}
                                    style={{
                                        width: 140,
                                        height: 180,
                                        borderRadius: 12,
                                        backgroundColor: 'orange',
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        marginRight: 12,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Image
                                        source={{uri: item.image}}
                                        style={{
                                            width: '100%',
                                            height: 125,
                                            borderTopLeftRadius: 15,
                                            borderTopRightRadius: 15,
                                            backgroundColor: 'orange',
                                            borderBottomLeftRadius: 15,
                                            borderBottomRightRadius: 15,
                                            resizeMode: 'cover',
                                        }}
                                    />
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: 'orange',
                                        borderBottomLeftRadius: 12,
                                        borderBottomRightRadius: 12,
                                        paddingHorizontal: 8,
                                        paddingVertical: 8,
                                        justifyContent: 'center',
                                    }}>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={{
                                                fontWeight: 'bold',
                                                fontSize: 13,
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
                                            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>
                                                {formatPrice(item.price)}đ
                                            </Text>
                                            <TouchableOpacity
                                                style={{
                                                    backgroundColor: '#FF3B30',
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
                                                <Text style={{color: '#fff', fontSize: 20, fontWeight: 'bold'}}>+</Text>
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
                            style={{paddingLeft: 16, marginTop: 8}}
                            renderItem={({item}) => (
                                <View style={{width: 120, marginRight: 12, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee'}}>
                                    <Image source={{uri: item.image}} style={{width: '100%',
                                            height: 100,
                                            borderTopLeftRadius: 15,
                                            borderTopRightRadius: 15,
                                            backgroundColor: 'orange',
                                            borderBottomLeftRadius: 15,
                                            borderBottomRightRadius: 15,
                                            resizeMode: 'cover',}} />
                                    <Text numberOfLines={3} style={{fontWeight: 'bold', marginTop: 5, fontSize: 12}}>{item.title}</Text>
                                </View>
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
    borderrandom:{
        width: 160,
        height: 170,
        margin: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    borderender: {
        flexDirection: "row",
        height: 120,
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    inputContainerStyle:{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 16,
        marginHorizontal: 20,
        paddingHorizontal: 16,
        width: 350,
        height: 50,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    recommendedCard: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
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
    productCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
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
});
export default ServicesCustomer;
