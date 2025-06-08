import React, { useState, useEffect } from "react";
import { Image, View, FlatList, TouchableOpacity, Alert, TextInput,StyleSheet  } from "react-native";
import { IconButton, Text} from "react-native-paper";
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

const Services = ({ navigation }) => {
    const [initialServices, setInitialServices] = useState([]);
    const [services, setServices] = useState([]);
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState(null);

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
            });

        return () => unsubscribe();
    }, []);

    // Tải logo từ Firebase Storage
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const url = await storage().ref('logo/LOGO_EVIET.jpg').getDownloadURL();
                setLogoUrl(url);
            } catch (error) {
                console.log('Error loading logo from Firebase:', error);
                // Sử dụng local logo nếu không tải được từ Firebase
            }
        };
        
        fetchLogo();
    }, []);

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleAppointment(item)} style={{ margin: 10,padding: 15, borderRadius: 15, marginVertical: 5, backgroundColor: '#e0e0e0' }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }}>
                <Text style={{fontSize: 18, fontWeight: "bold"}}>{item.title}</Text>
                <Text style={{fontSize: 18, fontWeight: "bold"}}>{formatPrice(item.price)}</Text>
            </View>
        </TouchableOpacity>
    );
    
    const handleAppointment = (service) => {
        navigation.navigate("ServiceDetail", { service });
    }

    const handleUpdate = async (service) => {
        try {
            navigation.navigate("ServiceUpdate", { service });
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
        }
    }
    


    return (
        <View style={{ backgroundColor:"white"}}>
            <View style={{paddingLeft:20,paddingRight:20, alignItems: 'center', }} >
                <TextInput
                    value={name}
                    placeholder="Tìm kiếm"
                    placeholderTextColor="black"
                    style={styles.inputContainerStyle}
                    onChangeText={(text) => {
                        setName(text);
                        const result = initialServices.filter(service => service.title.toLowerCase().includes(text.toLowerCase()));
                        setServices(result);
                    }}
                    
                />
            </View>
            <TouchableOpacity 
                onPress={() => navigation.navigate("UploadLogo")}
                style={{alignItems: 'center'}}
            >
                {logoUrl ? (
                    <Image 
                        source={{ uri: logoUrl }}
                        style={{
                            alignSelf: "center",
                            marginVertical: 20,
                            width: 200,
                            height: 100
                        }}
                        resizeMode="contain"
                    />
                ) : null}
                <Text style={{color: 'blue', fontSize: 14, marginTop: -10}}>Nhấn để thay đổi logo</Text>
            </TouchableOpacity>
            
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <Text style={{
                    padding: 15,
                    fontSize: 25,
                    fontWeight: "bold",
                }}>
                    Danh sách sản phẩm</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("AddNewService")}>
                      <Image source={require('../assets/add.png')} style={{ width: 30, height: 30, margin: 20 }} />
                    </TouchableOpacity>
            </View>
            <View style={{paddingBottom:40}}>
            <FlatList
                data={services}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={{height:300}}
            />
            </View>
        </View>
    )
}

export default Services;
const styles = StyleSheet.create({
    inputContainerStyle:{
        color:'black',
        borderColor: "black", // Viền ngoài màu đen
        backgroundColor: "white",
        borderWidth: 1, // Độ dày viền
        borderRadius: 10, // Bo tròn góc
        marginTop: 10,
        width: '97%', // Đặt chiều rộng theo tỷ lệ phần trăm
        alignSelf: 'center' // Căn giữa input
    },
})