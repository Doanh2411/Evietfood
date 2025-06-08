import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import firestore from "@react-native-firebase/firestore";
import auth from '@react-native-firebase/auth';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [disableGetPassword, setDisableGetPassword] = useState(true);

  const hasErrorEmail = () => !email.includes('@');

  const handleGetPassword = async () => {
    setError('');
    setPassword('');
    
    try {
      // Kiểm tra email trong collection USERS của Firestore
      const userDoc = await firestore()
        .collection('USERS')
        .where('email', '==', email)
        .get();

      if (!userDoc.empty) {
        // Email tồn tại trong Firestore, gửi link reset password
        await auth().sendPasswordResetEmail(email);
        setPassword('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu');
      } else {
        // Email không tồn tại trong Firestore
        setError('Email không tồn tại trong hệ thống.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };
  useEffect(() => {
    setDisableGetPassword(email.trim() === '' || hasErrorEmail());
  }, [email]);

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor:"white" }}>
      <Text style={{
        fontSize: 30,
        fontWeight: "bold",
        alignSelf: "center",
        color: "orange",
        marginTop: 100,
        marginBottom: 50
      }}>
        Quên Mật Khẩu
      </Text>
      <TextInput
        label={"Email"}
        value={email}
        onChangeText={setEmail}
        style={styles.textinput}
      />
      <HelperText style={{paddingLeft:30}} type='error' visible={hasErrorEmail()}>
        Địa chỉ email không hợp lệ
      </HelperText>
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      {password && (
        <Text style={styles.successText}>
          {password}
        </Text>
      )}
      <Button style={styles.button} mode='contained' textColor='black' buttonColor='orange' onPress={handleGetPassword} disabled={disableGetPassword}>
        Đặt Lại Mật Khẩu
      </Button>
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        <Button onPress={() => navigation.navigate("Login")}>
          Quay Lại Đăng Nhập
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  header:{
    fontSize: 30,
    fontWeight: "bold",
    alignSelf: "center",
    color: "orange",
    marginTop: 70,
    marginBottom: 70
  },
  textinput:{
    borderRadius: 10, marginRight:25,marginLeft:25, marginBottom:10, marginTop:150
  },
  
  button:{
    marginRight:40,marginLeft:40, borderRadius:5, marginTop:20
  },
  
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20
  },
  
  successText: {
    color: 'green',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    fontSize: 16
  }
})
export default ForgotPassword;
