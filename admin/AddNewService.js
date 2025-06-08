import React, { useState, useEffect } from "react"
import { View, Image,StyleSheet, Alert,TouchableOpacity } from "react-native"
import { Text, TextInput, Button } from "react-native-paper"
import firestore from '@react-native-firebase/firestore'
import storage from "@react-native-firebase/storage"
import ImagePicker from "react-native-image-crop-picker"
import { useMyContextProvider } from "../index"
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors"
import { ScrollView } from "react-native-gesture-handler"


const AddNewService = ({navigation}) => {
    const [controller, dispatch] = useMyContextProvider()
    const {userLogin} = controller
    const [imagePath, setImagePath] = useState('')
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [type, setType] = useState('')
    const [image, setImage] = useState('')
    const SERVICES = firestore().collection("Services")
    const TYPE = firestore().collection("Type")
    const [categories, setCategories] = useState([]); // State to hold categories
    
    const fetchCategories = async () => {
        const categorySnapshot = await firestore().collection('Type').get();
        const categoryList = categorySnapshot.docs.map(doc => doc.data().type);
        setCategories(categoryList);
    };
    
    useEffect(() => {
        fetchCategories();
    }, []);
    
    const handleAddNewService = () => {
        if (!imagePath) {
            Alert.alert("Lỗi", "Vui lòng chọn ảnh cho sản phẩm.");
            return;
        }
        if (!title.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên sản phẩm.");
            return;
        }
        if (!price.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập giá sản phẩm.");
            return;
        }
        if (!type.trim()) {
            Alert.alert("Lỗi", "Vui lòng chọn loại sản phẩm.");
            return;
        }

        SERVICES
        .add({
            title,
            price: price + '.000', // Added .000 to the price
            type,
            create: userLogin.email
        })
        .then(response =>{
            const refImage = storage().ref("/services/" + response.id + ".png")
            refImage.putFile(imagePath)
            .then(
                ()=>
                    refImage.getDownloadURL()
                    .then(link =>
                        {
                            SERVICES.doc(response.id).update({
                                id: response.id, 
                                image: link
                            })
                            Alert.alert("Thành công", "Sản phẩm đã được thêm thành công.", [
                                { text: "OK", onPress: () => navigation.navigate("Services") }
                            ]);
                        }
                    )
                )
            .catch(e => {
                console.log(e.message);
                Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.");
            })
        })
        .catch(e => {
            console.log(e.message);
            Alert.alert("Lỗi", "Không thể thêm sản phẩm. Vui lòng thử lại.");
        })
        
        
    }

    const handleAddType = (type) => {
        TYPE
        .add({
            type
        })
        .then(() => {
            fetchCategories();
            setType('');
        })
        .catch(error => {
            console.error("Error adding type:", error);
            Alert.alert("Lỗi", "Không thể thêm loại sản phẩm. Vui lòng thử lại.");
        });
    }
    const handleMinusType = (type) => {
        Alert.alert(
            "Cảnh báo!",
            "Bạn có chắc muốn xóa thể loại này không?",
            [
                {
                    text: "Trở lại",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: () => {
                        firestore()
                            .collection('Type')
                            .where('type','==',type)
                            .get()
                            .then((querySnapshot) => {
                                // Delete each matching document
                                querySnapshot.forEach((doc) => {
                                    doc.ref.delete();
                                });
                                console.log("Thể loại đã được xóa thành công!");
                                // Fetch categories again after deletion
                                fetchCategories();
                                setType('');
                            })
                            .catch(error => {
                                console.error("Lỗi khi xóa dịch vụ:", error);
                            });
                    },
                    style: "default"
                }
            ]
        );
    }
    
    const handleUploadImage = () =>{
        ImagePicker.openPicker({
            mediaType: "photo",
            width: 350, // Changed width to 300
            height: 300, // Changed height to 300
            cropping: true // Added cropping option
        })
        .then(image =>
            setImagePath(image.path)
        )
        .catch(e=> console.log(e.message))
    }

    const formatToVND = (value) => {
        // Remove non-digit characters
        const numericValue = value.replace(/\D/g, '');
        // Format to VND
        return numericValue ? numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '': '';
    }

    const handlePriceChange = (text) => {
        // Remove all non-digit characters
        const numericValue = text.replace(/\D/g, '');
        // Format and set the new value without moving the cursor
        const formattedValue = numericValue ? formatToVND(numericValue) : '';
        setPrice(formattedValue);
    }

    return (
        <ScrollView style={{ padding: 10, flex:1, backgroundColor:"white" }}>
            
            <Button textColor="black" buttonColor="orange" style={styles.button} mode="contained" onPress={handleUploadImage}>
                Upload Ảnh
            </Button>
            {((imagePath!= "")&&
            <Image source={{uri: imagePath}}
                style={{ width: 140, height: 120, borderRadius: 15, alignSelf:"center" }}
            />
            )}
            <Text style={styles.title}>Tên sản phẩm :</Text>
            <TextInput
                placeholder="Nhập tên sản phẩm"
                value={title}
                onChangeText={setTitle}
                style={styles.textinput}
            />
            <Text style={styles.title}>Giá :</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    placeholder="0"
                    value={price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                    style={[styles.textinput, { flex: 1 }]} // Thêm flex: 1 vào style
                    right={<TextInput.Affix text=".000 VNĐ" />} // Thêm dòng này để hiển thị .000 VNĐ
                />
            </View>
            <Text style={styles.title}>Loại sản phẩm :</Text>
            
            <TextInput
                placeholder="Loại sản phẩm"
                value={type}
                onChangeText={setType}
                style={styles.textinput}
            />
            <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'space-between'}}>
                <Text style={styles.title}>Loại sản phẩm hiện có :</Text>
                <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => handleAddType(type)}>
                    <Image source={require('../assets/addgreen.png')} style={{ width: 30, height: 30, margin: 20 }} />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginBottom: 15 }} onPress={() => handleMinusType(type)}>
                    <Image source={require('../assets/minus.png')} style={{ width: 30, height: 30, margin: 20 }} />
                </TouchableOpacity>
            </View>
            
            <View style={{marginLeft: 20,flexDirection: "row" }}>
                {categories.map((category, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[
                            styles.categoryButton, 
                            { 
                                backgroundColor: 'white',
                                marginRight: 10 // Thêm khoảng cách giữa các button
                            }
                        ]} 
                        onPress={() => setType(category)}
                    >
                        <Text style={styles.buttonText}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Button style={styles.buttonadd}  textColor="black" mode="contained" onPress={handleAddNewService}>Thêm sản phẩm</Button>
        </ScrollView>
    );
}; 
const styles = StyleSheet.create({
    title:{
        fontSize: 20, fontWeight: 'bold',paddingBottom:15
    },
    textinput:{
        fontSize:20,marginBottom: 10, borderWidth: 1, borderRadius:10
    },
    buttonadd:{
        margin: 40, 
        backgroundColor:"orange",
    },
    button:{
        margin:20, 
        backgroundColor:"orange",
        marginLeft:80,
        marginRight:80
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'black',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
})
export default AddNewService;

