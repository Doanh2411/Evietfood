import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ServicesCustomer from '../screens/ServicesCustomer';
import { useMyContextProvider } from "../index";
import ProductDetail from "../screens/ProductDetail";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Image, Text, TextInput} from "react-native";
import PostDetail from "../screens/PostDetail";
const Stack = createStackNavigator();

const RouterServiceCustomer = ({ navigation }) => {
    const [controller] = useMyContextProvider();
    const { userLogin } = controller || {};
    
    return (
        //đây là router của customer
        //thanh ở trên đầu của cus
        <Stack.Navigator
            initialRouteName="ServicesCustomer"
            screenOptions={{
                headerTitleAlign: "left",
                headerStyle: {
                    backgroundColor: "orange"
                },
                headerRight: (props) => (
                    <TouchableOpacity onPress={() => navigation.navigate("ProfileCustomer")}>
                      
                      <Image source={require('../assets/account.png')} style={{ width: 30, height: 30, margin: 20 }} />
                    </TouchableOpacity>
                  ),
            }}>

            <Stack.Screen 
            name="ServicesCustomer" 
            component={ServicesCustomer} 
            options={{
                headerShown: false            
            }} 
            />
            
            <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetail} 
            options={{
                headerShown: false
            }}/>
            <Stack.Screen 
            name="PostDetail" 
            component={PostDetail} 
            options={{
                headerShown: false
            }}/>
            
        </Stack.Navigator>
    )
}

export default RouterServiceCustomer;
