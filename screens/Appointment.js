import React, { useState, useEffect } from "react"
import { View, Image, Alert, StyleSheet, ScrollView, TextInput } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Text } from "react-native-paper"
import firestore from "@react-native-firebase/firestore"
import { useMyContextProvider } from "../index"
import { useCart } from "../routers/CartContext"

const Appointment = ({navigation, route }) => {
    const { service } = route.params || {};
    const [controller] = useMyContextProvider()
    const {userLogin} = controller || {};
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [similarProducts, setSimilarProducts] = useState([]);

    // Lấy sản phẩm tương tự (giả lập: lấy 3 sản phẩm khác trong collection Services)
    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const snapshot = await firestore().collection('Services').limit(4).get();
                const products = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(item => item.id !== service?.id)
                    .slice(0, 3);
                setSimilarProducts(products);
            } catch (e) {
                setSimilarProducts([]);
            }
        };
        fetchSimilar();
    }, [service]);

    const handleAddToCart = () => {
        
        addToCart({ ...service, quantity, note });
        Alert.alert(
            "Thành công",
            "Sản phẩm đã được thêm vào giỏ hàng",
            [{ text: "OK" }]
        );
    };
    //ham hien thi gia tien
    const formatPrice = (price) => {
        if (!price) return "0";
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <View style={styles.container}>
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: service?.image }} style={styles.mainImage} />
                <Text style={styles.productName}>{service?.title}</Text>
                <Text style={styles.productPrice}>GIÁ: {formatPrice(service?.price)}đ</Text>
                <Text style={styles.productDesc}>{service?.description || 'Mì gói hảo hảo cùng với trứng luộc, xúc xích, rau, bắp cải ngon tuyệt.'}</Text>
                {/* <Text style={styles.label}>GHI CHÚ:</Text>
                <TextInput
                    style={styles.noteInput}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Nhập ghi chú cho món này"
                    placeholderTextColor="#888"
                /> */}
                <View style={styles.similarHeader}>
                    <Text style={styles.label}>SẢN PHẨM TƯƠNG TỰ</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarList}>
                    {similarProducts.map(item => (
                        <View key={item.id} style={styles.similarItem}>
                            <Image source={{ uri: item.image }} style={styles.similarImage} />
                            <Text style={styles.similarTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.similarPrice}>{formatPrice(item.price)}đ</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.quantityRow}>
                    <Text style={styles.label}>Số lượng</Text>
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
                <Text style={styles.totalText}>Tổng: {formatPrice((service?.price || 0) * quantity)}đ</Text>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        padding: 16,
    },
    mainImage: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        marginBottom: 12,
        resizeMode: 'contain',
        backgroundColor: '#fff',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
        textAlign: 'left',
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B00',
        marginBottom: 4,
        textAlign: 'left',
    },
    productDesc: {
        fontSize: 15,
        color: '#444',
        marginBottom: 12,
        textAlign: 'left',
    },
    label: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 8,
    },
    noteInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 10,
        fontSize: 15,
        marginBottom: 12,
        backgroundColor: '#fff',
        color: '#222',
    },
    similarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 4,
    },
    seeAll: {
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 14,
    },
    similarList: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    similarItem: {
        width: 120,
        backgroundColor: '#fff7ed',
        borderRadius: 14,
        alignItems: 'center',
        marginRight: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    similarImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginBottom: 6,
        backgroundColor: '#fff',
    },
    similarTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 4,
        textAlign: 'center',
    },
    similarPrice: {
        fontSize: 15,
        color: '#FF3B30',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    quantityButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 4,
        marginHorizontal: 6,
    },
    quantityButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginHorizontal: 10,
    },
    totalText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 16,
        textAlign: 'left',
        marginLeft: 0,
        marginTop: 0,
    },
    addToCartButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default Appointment;
