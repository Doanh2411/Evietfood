import React, { useState, useEffect } from "react";
import { View, FlatList,TouchableOpacity,StyleSheet,Alert, Image } from "react-native";
import { Text,Card,Title,Paragraph, Button,IconButton } from "react-native-paper";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import firestore from '@react-native-firebase/firestore';
import { useMyContextProvider } from "../index";
import { useNavigation } from '@react-navigation/native'; // Thêm import này

const Appointadmin = () => {
    const [appointments, setAppointments] = useState([]);
    const [isSelected, setSelection] = useState([]);
    const [services, setServices] = useState([]); // State để lưu dịch vụ
    const navigation = useNavigation(); // Khởi tạo navigation
    useEffect(() => {
        const unsubscribe = firestore()
            .collection('Appointments')
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

    const handleUpdateService = async (item) => {
        try {
            await firestore()
                .collection('Appointments')
                .doc(item)
                .update({
                    state: "complete"
                });
        } catch (error) {
            console.error("Lỗi khi cập nhật dịch vụ:", error);
        }
        
    }
    const handleDelete = (item) => {
        Alert.alert(
            "Cảnh báo",
            "Bạn có chắc muốn xoá hoá đơn này, nó sẽ không thể khôi phục lại!!!",
            [
                {
                    text: "Trở lại",
                    style: "cancel"
                },
                {
                    text: "Xoá",
                    onPress: () => {
                        firestore()
                            .collection('Appointments')
                            .doc(item.id)
                            .delete()
                            .then(() => {
                                console.log("Deleted successfully!");
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                    },
                    style: "destructive"
                }
            ]
        );
    };
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
    const handleOrderDetail = (orderId) => {
        navigation.navigate("OrderDetail", { orderId });
    };
// show các lịch
const renderItem = ({ item }) => {
    const service = services.find(s => s.id === item.serviceId); // Tìm dịch vụ tương ứng với item
    return (
        <Card style={styles.card}>
            <Card.Content>
                <Paragraph style={[styles.text, 
                    item.state === 'new' ? styles.redText : 
                    item.state === 'completed' ? styles.greenText : 
                    styles.defaultText
                ]}>
                    Trạng thái: {item.state === 'new' ? 'Đang giao' : 'Đã hoàn thành'}
                </Paragraph>
                <Paragraph style={styles.text}>Thời gian: {item.datetime ? item.datetime.toDate().toLocaleString() : 'Không xác định'}</Paragraph>
                <Paragraph style={styles.text}>
                    Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')}.000 vnđ
                </Paragraph>
                {service && <Paragraph style={styles.text}>Dịch vụ: {service.name}</Paragraph>} 
                <Button onPress={() => navigation.navigate('OrderDetail', { order: item })}>Xem chi tiết</Button>
            </Card.Content>
            <Card.Actions>
            <Menu>
                <MenuTrigger>
                    <Image source={require("../assets/dots.png")}
                    style={{
                        justifyContent:"flex-end",
                        width:25,
                        height:25
                        
                    }}></Image>
                </MenuTrigger>
                <MenuOptions>
                    <MenuOption onSelect={() => handleUpdateService(item.id)}>
                        <Text style={styles.menuOption}>Xác nhận</Text>
                    </MenuOption>
                    <MenuOption onSelect={() => handleDelete(item)}>
                        <Text style={styles.menuOption}>Xoá</Text>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        </Card.Actions>
        </Card>
    
);};


    
    
    return (
        <View style={{flex:1, backgroundColor:"white"}}>
            <Text style={{ padding: 15, fontSize: 25, fontWeight: "bold", backgroundColor:"orange" }}>Đơn hàng</Text>
            <FlatList
                data={appointments}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                
            />
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 17, fontWeight: "bold"
    },
    card: {
        margin: 10,
        borderRadius: 15,
        elevation: 3,
        backgroundColor: '#E0EEE0',
    },
    menuOption: {
        fontSize: 16,
        padding: 10,
    },
});
export default Appointadmin;
