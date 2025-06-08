import { StyleSheet, Text, TouchableOpacity, View, Alert, ToastAndroid } from 'react-native';
import React, { useState } from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import {logout, useMyContextProvider } from '../index';

const ChangePassword = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [password, setPassword] = useState('');
  const hasErrorPass = () => password.length < 6
  const navigation = useNavigation();
  const [controller] = useMyContextProvider();
  const { userLogin } = controller;

  const handleChangePassword = async () => {
    try {
      if (!userLogin || !userLogin.phone) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      // Kiểm tra mật khẩu hiện tại
      const userDoc = await firestore()
        .collection('USERS')
        .doc(userLogin.phone)
        .get();

      if (!userDoc.exists) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const userData = userDoc.data();
      if (userData.password !== currentPass) {
        Alert.alert('Lỗi', 'Mật khẩu hiện tại không chính xác');
        return;
      }

      // Cập nhật mật khẩu mới
      await firestore()
        .collection('USERS')
        .doc(userLogin.phone)
        .update({ password: password });

      Alert.alert('Thành công', 'Cập nhật mật khẩu thành công, vui lòng đăng nhập lại');
      logout();
      navigation.navigate("Login");
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      Alert.alert('Lỗi', 'Đổi mật khẩu thất bại');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.textform}>Mật khẩu hiện tại</Text>
      <TextInput
        style={styles.input}
        value={currentPass}
        onChangeText={setCurrentPass}
        secureTextEntry
      />

      <Text style={styles.textform}>Mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <HelperText style={{alignSelf:'flex-start', marginLeft: 25,marginRight: 30,fontSize:18}} 
      type="error" visible={hasErrorPass()}>
        Mật khẩu mới phải từ 6 kí tự trở lên</HelperText>
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor:"white"
  },
  textform: {
    marginBottom: 8,
    fontSize: 20,
    margin: 30,
    color: 'black',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#80bfff',
    borderWidth: 1,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
  },
  button: {
    marginTop: 20,
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 10,
    marginLeft: 30,
    marginRight: 30,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 30,
    marginRight: 30,
  },
});
