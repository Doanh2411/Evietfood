import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import axios from 'axios';
import API_CONFIG from '../api';

const OrderDetail = ({ route, navigation }) => {
    const { id } = route.params; // Lấy id sản phẩm
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Gọi API lấy chi tiết sản phẩm
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products/${id}`);
                // Tùy vào cấu trúc API, có thể là response.data.data hoặc response.data
                setProduct(response.data.data || response.data);
                console.log('Chi tiết sản phẩm:', response.data.data || response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu sản phẩm: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Hàm hiển thị giá tiền
    const formatPrice = (price) => {
        if (!price) return '0';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Chi tiết sản phẩm</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#6200ee" />
                ) : product ? (
                    <View>
                        {product.image_url && (
                            <Image
                                source={{ uri: product.image_url.startsWith('http') ? product.image_url : `${API_CONFIG.BASE_URL}/${product.image_url}` }}
                                style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 16 }}
                            />
                        )}
                        <Text style={styles.label}>Tên sản phẩm:</Text>
                        <Text style={styles.value}>{product.name}</Text>
                        <Text style={styles.label}>Giá:</Text>
                        <Text style={styles.value}>{formatPrice(product.sale_price)} đ</Text>
                        <Text style={styles.label}>Mô tả:</Text>
                        <Text style={styles.value}>{product.description}</Text>
                        {/* Thêm các trường khác nếu cần */}
                    </View>
                ) : (
                    <Text>Không tìm thấy sản phẩm</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default OrderDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1a1a1a',
    },
    statusBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    statusText: {
        fontSize: 16,
        color: '#1976D2',
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 17,
        color: '#666',
        flex: 1,
    },
    value: {
        fontSize: 17,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    servicesCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1a1a1a',
    },
    serviceItem: {
        marginBottom: 12,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 18,
        color: '#333',
        marginBottom: 4,
    },
    quantity: {
        fontSize: 16,
        color: '#666',
    },
    servicePrice: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    paymentButton: {
        borderRadius: 12,
        paddingVertical: 8,
        backgroundColor: '#6200ee',
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
});