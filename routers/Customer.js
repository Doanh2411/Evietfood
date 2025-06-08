import React from "react";
import { Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RouterServiceCustomer from "./RouterServiceCustomer";
import RouterCart from "./RouterCart";
import { Image } from "react-native";
import Cart from "../screens/Cart";

import RouterProfile from "./RouterProfile";
import RouterAppointment from "./RouterAppointment";
import Map from "../screens/Map";


  const Tab = createBottomTabNavigator();
  //đây là thanh dưới của customer
  const color = "#FF8C00"
  const Customer = () => {
    
    return (
      <Tab.Navigator
        
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          tabBarActiveTintColor: 'orange',
          tabBarStyle: { backgroundColor: 'red', height: 65 },
          tabBarPressColor: 'transparent',
        }}
        
      >
        <Tab.Screen
          name="RouterServiceCustomer"
          component={RouterServiceCustomer}
          options={{
            headerShown: false,
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <>
              <Image
                source={require("../assets/home.png")}
                style={[styles.tabbar, { tintColor: color }]}
              />
              <Text style={[styles.textbar, { color: color }]}>Trang chủ</Text>
              </>
            ),
            
          }}
        />
        <Tab.Screen
          name="RouterCart"
          component={RouterCart}
          options={{
            headerShown: false,
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <>
              <Image
                source={require("../assets/iconcart.png")}
                style={[styles.tabbarcart, { tintColor: color }]}
              />
              <Text style={[styles.textbar, { color: color }]}>Giỏ hàng</Text>
              </>
            ),
            
          }}
        />
        {/* <Tab.Screen
          name="Map"
          component={Map}
          options={{
            headerShown: false,
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <>
              <Image
                source={require("../assets/map.png")}
                style={[styles.tabbar, { tintColor: color }]}
              />
              <Text style={[styles.textbar, { color: color }]}>Map</Text>
              </>
            ),
            
          }}
        /> */}
        <Tab.Screen
          name="RouterAppointment"
          component={RouterAppointment}
          options={{
            headerShown: false,
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <>
              <Image
                source={require("../assets/appointment.png")}
                style={[styles.tabbar, { tintColor: color }]}
              />
              <Text style={[styles.textbar, { color: color }]}>Đơn hàng</Text>
              </>
            ),
            
          }}
        />
        
        <Tab.Screen
          name="RouterProfile"
          component={RouterProfile}
          options={{
            headerShown: false,
            tabBarLabel: "",
            tabBarIcon: ({ color }) => (
              <>
              <Image
                source={require("../assets/customer.png")}
                style={[styles.tabbar, { tintColor: color }]}
              />
              <Text style={[styles.textbar, { color: color }]}>Hồ sơ</Text>
              </>
            ),
            
          }}
        />
      </Tab.Navigator>
    );
  };

export default Customer;
const styles = StyleSheet.create({
  
  tabbar: {
    width: 24, height: 24, tintColor: '#fff', marginTop: 15   
  },
  tabbarcart: {
    width: 30, height: 24, tintColor: '#fff', marginTop: 15 
  },
  textbar: {
    color: '#fff', marginTop: 3 
  },
  
})

