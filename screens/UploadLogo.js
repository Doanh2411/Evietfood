import React, { useState } from 'react';
import { View, Image, StyleSheet, Alert, TouchableOpacity, Text as RNText } from 'react-native';
import { Text, Button } from 'react-native-paper';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';

const UploadLogo = ({ navigation }) => {
  const [imagePath, setImagePath] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSelectImage = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      width: 400,
      height: 200,
      cropping: true
    })
    .then(image => {
      setImagePath(image.path);
    })
    .catch(error => {
      console.log(error);
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      }
    });
  };

  const handleUploadLogo = async () => {
    if (!imagePath) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh logo trước khi tải lên.');
      return;
    }

    setUploading(true);

    try {
      // Tạo tham chiếu đến đường dẫn lưu trữ trên Firebase
      const reference = storage().ref('/logo/logo.png');
      
      // Tải ảnh lên Firebase Storage
      await reference.putFile(imagePath);
      
      // Lấy URL của ảnh đã tải lên
      const downloadURL = await reference.getDownloadURL();
      
      setUploading(false);
      Alert.alert(
        'Thành công', 
        'Logo đã được tải lên thành công!',
        [
          { 
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      setUploading(false);
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tải lên Logo mới</Text>
      
      <TouchableOpacity onPress={handleSelectImage} style={styles.imageContainer}>
        {imagePath ? (
          <Image source={{ uri: imagePath }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <RNText style={styles.placeholderText}>Nhấn để chọn ảnh</RNText>
          </View>
        )}
      </TouchableOpacity>
      
      <Button 
        mode="contained" 
        onPress={handleUploadLogo}
        loading={uploading}
        disabled={uploading || !imagePath}
        style={styles.button}
      >
        {uploading ? 'Đang tải lên...' : 'Tải lên'}
      </Button>
      
      <Button 
        mode="outlined" 
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
      >
        Hủy
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
});

export default UploadLogo; 