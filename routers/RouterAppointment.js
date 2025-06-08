import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import OrderDetail from "../screens/OrderDetail";

import Appointments from "../screens/Appointments";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Image, Text } from "react-native";
import Transaction from "../screens/Transaction";

import PaymentZalo from "../screens/PaymentZalo";
const Stack = createStackNavigator();

const RouterAppointment = ({ navigation }) => {
    

    return (
        <Stack.Navigator
            initialRouteName="Appointments"
        >
            <Stack.Screen 
            name="Appointments" 
            component={Appointments} 
            options={{
                headerShown: false,
                
              }}
            />
            <Stack.Screen 
            name="PaymentZalo" 
            component={PaymentZalo} 
            options={{
                headerShown: false,
            }}
            />
            <Stack.Screen 
            name="Transaction" 
            component={Transaction} 
            options={{
                title: "Lịch sử đơn hàng",
                
                headerTitleStyle: { 
                    color: 'black', // Changed title color to white
                    fontSize: 25, // Increased font size to 30
                    fontWeight: 'bold' // Made the font bold
                },
            }}
            />
            <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetail} 
                options={{
                title: "Chi tiết đơn hàng",
                
                headerTitleStyle: { 
                    color: 'black', // Changed title color to white
                    fontSize: 25, // Increased font size to 30
                    fontWeight: 'bold' // Made the font bold
                },
            }}
            />
            
        </Stack.Navigator>
    )
}

export default RouterAppointment;
