import { createContext, useContext, useMemo, useReducer } from "react";
import { Alert,Dimensions } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
// AppRegistry
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
AppRegistry.registerComponent(appName, () => App);

// Display
const MyContext = createContext()
MyContext.displayName = "ChiliChicken";

// Reducer
const reducer = (state, action) => {
    switch (action.type) {
        case "USER_LOGIN":
            return { ...state, userLogin: action.value };
        case "SET_USER_LOGIN":
            return { ...state, userLogin: action.payload };
        case "LOGOUT":
            return { ...state, userLogin: null };
        default:
            throw new Error("Action không tồn tại");
    }
};

// MyContext
const MyContextControllerProvider = ({ children }) => {
    const initialState = {
        userLogin: null,
        services: [],
    };
    const [controller, dispatch] = useReducer(reducer, initialState);
    const value = useMemo(() => [controller, dispatch], [controller]);
    return (
        <MyContext.Provider value={value}>
            {children}
        </MyContext.Provider>
    );
};
// useMyContext
function useMyContextProvider() {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error("useMyContextProvider phải được sử dụng trong MyContextControllerProvider");
    };
    return context;
};

// Collections
const USERS = firestore().collection("USERS");

// Action
const createAccount = async (phone, password, fullName,  address, role, navigation) => {
    try {
        await USERS.doc(phone).set({
            phone,
            password,
            fullName,
            address,
            role: "customer"
        });
        
        Alert.alert(
            "Thành công",
            "Tạo tài khoản thành công với tài khoản là: " + phone,
            [
                { text: "OK" }
            ]
        );
        navigation.navigate("Login");
    } catch (error) {
        Alert.alert("Lỗi", "Không thể tạo tài khoản: " + error.message);
    }
};


const login = (dispatch, phone, password) => {
    // Truy vấn tài khoản bằng số điện thoại
    USERS.doc(phone).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                // Kiểm tra mật khẩu khớp với dữ liệu trên Firebase
                if (userData.password === password) {
                    dispatch({ type: "USER_LOGIN", value: userData });
                    // Alert.alert("Đăng nhập thành công với số điện thoại: " + phone);
                } else {
                    Alert.alert("Lỗi", "Mật khẩu không chính xác");
                }
            } else {
                Alert.alert("Lỗi", "Số điện thoại không tồn tại");
            }
        })
        .catch(e => Alert.alert("Lỗi", "Đăng nhập thất bại: " + e.message));
};


const logout = (dispatch) => {
    dispatch({ type: "LOGOUT", value: null })
};


export {
    MyContextControllerProvider,
    useMyContextProvider,
    createAccount,
    login,
    logout,
    
};