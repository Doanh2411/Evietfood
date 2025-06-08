import React, { useState, useEffect } from "react";
import { View, FlatList,StyleSheet } from "react-native";
import { Text,Card,Title,Paragraph,IconButton, Button } from "react-native-paper";
import firestore, { and } from '@react-native-firebase/firestore';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useMyContextProvider } from "../index";
import { useNavigation } from '@react-navigation/native'; // Thêm import này


const Transaction = () => {
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]); // State để lưu dịch vụ
    const [controller] = useMyContextProvider();
    const { userLogin } = controller;
    const navigation = useNavigation(); // Khởi tạo navigation

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('Appointments')
            .where('email', '==', userLogin.email)
            .where('state', '==', 'complete')
            .where('appointment', '==', 'paid')
            .onSnapshot(querySnapshot => {
                const appointmentsData = [];
                querySnapshot.forEach(documentSnapshot => {
                    appointmentsData.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id,
                    });
                });

                // Sắp xếp theo thời gian, đơn hàng mới nhất ở trên cùng
                appointmentsData.sort((a, b) => b.datetime.toDate() - a.datetime.toDate());
                setAppointments(appointmentsData);
            });
            
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesCollection = await firestore().collection('services').get();
                const servicesData = servicesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setServices(servicesData);
            } catch (error) {
                console.error("Lỗi khi lấy dịch vụ: ", error);
            }
        };

        fetchServices();
    }, []);

    // show các lịch
    const renderItem = ({ item }) => {
        const service = services.find(s => s.id === item.serviceId);
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.orderHeader}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {item.state === 'new' ? 'Đang duyệt' : 'Đã hoàn thành'}
                            </Text>
                        </View>
                        <Text style={styles.orderIdText}>
                            Mã đơn: {item.id.split('_').pop()}
                        </Text>
                    </View>

                    <Text style={styles.priceText}>
                        {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                    </Text>

                    <Text style={styles.dateText}>
                        {item.datetime ? item.datetime.toDate().toLocaleString() : 'Không xác định'}
                    </Text>

                    {service && (
                        <Text style={styles.dateText}>
                            Dịch vụ: {service.name}
                        </Text>
                    )}

                    <Button 
                        mode="contained"
                        style={styles.detailButton}
                        labelStyle={styles.detailButtonLabel}
                        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                    >
                        Xem chi tiết
                    </Button>
                </Card.Content>
            </Card>
        );
    };
    
    const handleOrderDetail = (orderId) => {
        navigation.navigate("OrderDetail", { orderId });
    };

    return (
        <View style={{ flex: 1 , backgroundColor:"white"}}>
            
            <FlatList
                data={appointments}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    )
}

export default Transaction;
const styles = StyleSheet.create({
    card: {
        margin: 10,
        borderRadius: 15,
        elevation: 4,
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 5,
        borderLeftColor: '#4CAF50', // Đổi sang màu xanh lá
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 25,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    detailButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});