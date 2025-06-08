import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Checkbox } from 'react-native-paper';
import { createAccount } from '../index';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const Register = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [disableCreate, setDisableCreate] = useState(true);
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  const hasErrorPhone = () => phone === "" || phone.length !== 10;

  useEffect(() => {
    setDisableCreate(hasErrorPhone());
  }, [phone, hasErrorPhone]);

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

  const handleRegister = async () => {
    try {
      const userDoc = await firestore()
        .collection('USERS')
        .doc(phone)
        .get();
      
      if (userDoc.exists) {
        Alert.alert(
          "Lỗi",
          "Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác.",
          [{ text: "OK" }]
        );
      } else {
        createAccount(phone, "", "", "", "", navigation);
      }
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Đã xảy ra lỗi khi kiểm tra tài khoản: " + error.message,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={{ alignSelf: 'center', paddingTop: 150 }}>
          {logoUrl && (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 10 }}
              resizeMode="contain"
            />
          )}
          </View>
          <Text style={styles.header}>Đăng ký</Text>
          
          <Text style={styles.inputLabel}>Số điện thoại*</Text>
          <TextInput
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#FFC107"
            activeOutlineColor="#FFC107"
            theme={{ roundness: 8, fonts: { regular: { fontSize: 16 } } }}
            contentStyle={{ paddingTop: 8 }}
          />
          <HelperText type="error" visible={hasErrorPhone()} style={styles.errorText}>
            Số điện thoại phải có ít nhất 10 số
          </HelperText>

          
          <Button
            style={styles.button}
            labelStyle={styles.buttonText}
            mode="contained"
            onPress={handleRegister}
            disabled={disableCreate}
            
          >
            Đăng ký
          </Button>

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Bạn đã có tài khoản?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginText}>Đăng nhập tại đây</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 0,
    height: 50,
    borderRadius: 12,
    theme: { roundness: 8, fonts: { regular: { fontSize: 16 } } },
    contentStyle: { paddingTop: 8 },
  },
  errorText: {
    color: "#DC3545",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 0,
    fontSize: 13,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#222',
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 18,
    paddingVertical: 8,
    backgroundColor: '#DC3545',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'white',
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  promptText: {
    fontSize: 15,
    color: "#222",
  },
  loginText: {
    fontSize: 15,
    fontWeight: "bold",
    color: '#DC3545',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});

export default Register;
