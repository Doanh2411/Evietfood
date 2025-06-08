import React, { useEffect, useState } from 'react';
import { Image, View, TouchableOpacity, ImageBackground,TextInput, StyleSheet, Alert } from 'react-native';
import {  Button, Text, HelperText } from 'react-native-paper';
import { useMyContextProvider, login } from '../index';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BorderlessButton } from 'react-native-gesture-handler';
import storage from '@react-native-firebase/storage';

const Login = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [controller, dispatch] = useMyContextProvider();
  const { userLogin } = controller;
  const [showPassword, setShowPassword] = useState(true);
  const [disableLogin, setDisableLogin] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);
  const hasErrorPhone = () => phone === '' || phone.length < 10;
  const hasErrorPassword = () => password.length < 6;

  useEffect(() => {
    setDisableLogin(phone.trim() === '' || password.trim() === '' || hasErrorPhone() || hasErrorPassword());
  }, [phone, password, hasErrorPhone, hasErrorPassword]);

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

  const handleLogin = () => {
    login(dispatch, phone, password);
  };

  // Xử lý chuyển hướng sau khi đăng nhập thành công
  useEffect(() => {
    if (userLogin) {
      if (userLogin.role === "admin") {
        navigation.navigate("Admin");
      } else if (userLogin.role === "customer" || userLogin.role === "user") {
        navigation.navigate("Customer");
      }
    }
  }, [userLogin, navigation]);

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: 'white', paddingTop: 50 }}>
      <View style={{ height: 170, alignSelf: 'center', marginBottom: 10}}>
      {logoUrl && (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 10 }}
          resizeMode="contain"
        />
      )}
      </View>
      <Text style={styles.loginTitle}>Đăng nhập</Text>
      <Text style={styles.inputLabel}>Số điện thoại</Text>
      <TextInput
        label={null}
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        style={[styles.inputsdt, {color: '#222'}]}
        underlineColor="transparent"
        theme={{ colors: { primary: '#FFC107', text: '#222', placeholder: '#888' } }}
        placeholderTextColor="#888"
      />
      <HelperText style={styles.helperText} type='error' visible={hasErrorPhone()}>
        Số điện thoại phải có ít nhất 10 số
      </HelperText>
      <Text style={styles.inputLabel}>Mật khẩu</Text>
      <View style={{ marginRight: 40, marginLeft: 40, position: 'relative' }}>
        <TextInput
          label={null}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={showPassword}
          style={[styles.input, {color: '#222', paddingRight: 50}]}
          underlineColor="transparent"
          theme={{ colors: { primary: '#FFC107', text: '#222', placeholder: '#888' } }}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={showPassword ? require('../assets/eye.png') : require('../assets/eye-hidden.png')}
            style={{ width: 20, height: 20, tintColor: '#FFC107' }}
          />
        </TouchableOpacity>
      </View>
      <HelperText style={styles.helperText} type='error' visible={hasErrorPassword()}>
        Password có ít nhất 6 ký tự
      </HelperText>
      <TouchableOpacity onPress={() => Alert.alert("Thông báo", "Tính năng hiện tại vẫn chưa thể sử dụng", [{ text: "OK" }])}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      <Button style={styles.loginBtn} mode='contained' textColor='white' buttonColor='#DC3545' onPress={handleLogin} disabled={disableLogin}>
        <Text style={styles.loginBtnText}>Đăng nhập</Text>
      </Button>
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
        <Text style={styles.noAccountText}>Bạn chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}> 
          <Text style={styles.registerText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  inputsdt: {
    marginRight: 0,
    marginLeft: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#FFC107',
    marginTop: 8,
    marginBottom: 0,
    paddingHorizontal: 10,
    width: '80%',
  },
  input: {
    marginRight: 0,
    marginLeft: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#FFC107',
    marginTop: 8,
    marginBottom: 0,
    paddingHorizontal: 10,
  },
  helperText: {
    marginLeft: 45,
    fontSize: 13,
    color: '#DC3545',
  },
  forgotText: {
    color: '#DC3545',
    fontSize: 15,
    textAlign: 'left',
    marginLeft: 40,
    marginTop: 8,
    marginBottom: 8,
  },
  loginBtn: {
    marginRight: 40,
    marginLeft: 40,
    marginTop: 18,
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    backgroundColor: '#DC3545',
    shadowColor: 'transparent',
  },
  loginBtnText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  noAccountText: {
    fontSize: 15,
    color: '#222',
  },
  registerText: {
    fontSize: 15,
    color: '#DC3545',
    fontWeight: 'bold',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  inputLabel: {
    marginLeft: 40,
    marginTop: 8,
    marginBottom: 2,
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
});
