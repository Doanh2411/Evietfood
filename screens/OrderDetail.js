import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore'; // Import Firebase

const OrderDetail = ({ route, navigation }) => {
    const { orderId } = route.params; // Thay đổi từ order sang orderId
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const orderDoc = await firestore()
                    .collection('Appointments')
                    .where('id', '==', orderId)
                    .get();

                if (!orderDoc.empty) {
                    setOrderData(orderDoc.docs[0].data());
                } else {
                    console.log("Không tìm thấy đơn hàng");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng: ", error);
            }
        };

        fetchOrderData();
    }, [orderId]);

    //ham hien thi gia tien
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Trạng thái đơn hàng</Text>
                {orderData ? (
                    <View style={styles.orderDetails}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {orderData.state === 'new' ? 'Đang duyệt' : 
                                orderData.state === 'complete' ? 'Đã hoàn thành' :
                                orderData.state === 'delivery' ? 'Đang chờ giao hàng' :  
                                orderData.state}
                            </Text>
                        </View>
                        
                        <View style={styles.infoSection}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Thời gian:</Text>
                                <Text style={styles.value}>
                                    {orderData.datetime ? orderData.datetime.toDate().toLocaleString() : 'Không xác định'}
                                </Text>
                            </View>
                            
                            <View style={styles.divider} />

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Trạng thái thanh toán:</Text>
                                <Text style={[
                                    styles.value,
                                    {color: orderData.appointment === 'paid' ? '#4CAF50' : '#FF5722'}
                                ]}>
                                    {orderData.appointment === 'paid' ? 'Đã thanh toán' : 
                                     orderData.appointment === 'online' ? 'Chờ thanh toán online' : 
                                     'Thanh toán khi nhận hàng'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.servicesCard}>
                            <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
                            {Array.isArray(orderData.services) && orderData.services.map((service, index) => (
                                <View key={index} style={styles.serviceItem}>
                                    <View style={styles.serviceRow}>
                                        <View style={styles.serviceInfo}>
                                            <Text style={styles.serviceName}>{service.title}</Text>
                                            <Text style={styles.quantity}>x{service.quantity}</Text>
                                        </View>
                                        <Text style={styles.servicePrice}>{formatPrice(service.price)} vnđ</Text>
                                    </View>
                                    {index !== orderData.services.length - 1 && <View style={styles.itemDivider} />}
                                </View>
                            ))}
                        </View>

                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Tổng tiền</Text>
                            <Text style={styles.totalAmount}>{formatPrice(orderData.totalPrice)} vnđ</Text>
                        </View>

                        {orderData.appointment !== 'paid' && (
                            <Button 
                                mode="contained" 
                                onPress={() => navigation.navigate("PaymentZalo", { orderId: orderId })}
                                style={[styles.paymentButton, { backgroundColor: '#0068FF' }]}
                                labelStyle={styles.buttonLabel}
                            >
                                Thanh toán Online
                            </Button>
                        )}
                    </View>
                ) : (
                    <ActivityIndicator size="large" color="#6200ee" />
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