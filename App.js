import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { MyContextControllerProvider } from './index';
import Router from './routers/Router';
import { MenuProvider } from 'react-native-popup-menu';
import { CartProvider } from './routers/CartContext';
import { LogBox, Text, TextInput } from 'react-native';

// --- Global Font Configuration ---
// The following code overrides the default render method for Text and TextInput
// to apply "Roboto" as the default font family.
const defaultFontFamily = { fontFamily: 'Roboto' };
const oldTextRender = Text.render;
Text.render = function (...args) {
    const origin = oldTextRender.call(this, ...args);
    return React.cloneElement(origin, {
        style: [defaultFontFamily, origin.props.style]
    });
};
const oldTextInputRender = TextInput.render;
TextInput.render = function (...args) {
    const origin = oldTextInputRender.call(this, ...args);
    return React.cloneElement(origin, {
        style: [defaultFontFamily, origin.props.style]
    });
};
// --- End Global Font Configuration ---

// Vô hiệu hóa tất cả cảnh báo console
LogBox.ignoreLogs(['Warning: ...']); // Bỏ qua log cụ thể
LogBox.ignoreAllLogs(); // Bỏ qua tất cả cảnh báo

const App = () => {
  //Create admin
  const USERS = firestore().collection("USERS")
  const admin = {
    fullName: "Admin",
    email: "admin@gmail.com",
    password: "123456",
    phone: "0912685449",
    address: "Bình Dương",
    role: "admin" 
  }
  useEffect(()=>{
    USERS.doc(admin.email)
    .onSnapshot(
      u => {
        if (!u.exists)
        {
          auth().createUserWithEmailAndPassword(admin.email, admin.password)
          .then(response =>
            {
              USERS.doc(admin.email).set(admin)
              console.log("Add new account admin")
            })
        }
      }
    )
  }, [])
  
  //Code show router
  return (
    <CartProvider>
      <MyContextControllerProvider>
        <MenuProvider>
          <NavigationContainer>
            <Router/>
          </NavigationContainer>
        </MenuProvider>
      </MyContextControllerProvider>
    </CartProvider>
  );
}
export default App
