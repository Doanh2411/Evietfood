import React, { useEffect, useState, useRef } from 'react';
import { View, PermissionsAndroid, Platform, Alert, TextInput, Button, Image, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useMyContextProvider } from '..';
const GEOAPIFY_API_KEY = 'be8283f0ca404169924653620c942bfa';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAY147ZFhEL1fg7jQ-CdrK-sncScdCucG4'; // Thêm Google Maps API key của bạn

const Map = () => {
  const [controller] = useMyContextProvider();
  const { userLogin } = controller;
  const [currentPosition, setCurrentPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState(null);
  const mapRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  
  const getCoordinatesFromAddress = async (address) => {
    try {
      if (!address.trim()) {
        Alert.alert('Error', 'Vui lòng nhập địa chỉ');
        return;
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].geometry.coordinates;
        setCurrentPosition({ latitude, longitude });
        setShowSuggestions(false);

        // Di chuyển map đến vị trí mới
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000);
      } else {
        Alert.alert('Error', 'Không tìm thấy địa chỉ. Vui lòng thử lại với địa chỉ khác.');
      }
    } catch (error) {
      console.error('Error details:', error);
      Alert.alert('Error', 'Không thể lấy tọa độ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission to access location',
            message: 'We need your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentPosition();
        } else {
          Alert.alert('Location permission denied');
        }
      } else {
        getCurrentPosition(); // iOS automatically handles permissions
      }
    };

    const getCurrentPosition = () => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ latitude, longitude });

          // Chuyển đổi tọa độ thành địa chỉ
          try {
            const response = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const addressData = data.features[0].properties;
              const formattedAddress = [
                addressData.housenumber,
                addressData.street,
                addressData.district,
                addressData.city,
                addressData.country
              ].filter(Boolean).join(', ');
              
              setAddress(formattedAddress);
            }
          } catch (error) {
            console.error('Error getting address:', error);
            Alert.alert('Error', 'Không thể lấy địa chỉ. Vui lòng thử lại.');
          }
        },
        (error) => {
          console.log(error);
          Alert.alert('Error', 'Unable to retrieve location. Please try again.');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (currentPosition && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  }, [currentPosition]);


  // Sửa lại hàm handleMapPress
  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    
    // Đặt marker tại vị trí được chọn
    setCurrentPosition(coordinate);
    
    // Chuyển đổi tọa độ thành địa chỉ
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const addressData = data.features[0].properties;
        const formattedAddress = [
          addressData.housenumber,
          addressData.street,
          addressData.district,
          addressData.city,
          addressData.country
        ].filter(Boolean).join(', ');
        
        // Cập nhật địa chỉ trong TextInput
        setAddress(formattedAddress);
        
        // Ẩn gợi ý địa chỉ nếu đang hiển thị
        setShowSuggestions(false);
        
        // Tùy chọn: Di chuyển map đến vị trí được chọn
        mapRef.current?.animateToRegion({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Không thể lấy địa chỉ. Vui lòng thử lại.');
    }
  };

  const getAddressSuggestions = async (text) => {
    try {
      setAddress(text);
      if (text.length < 2) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&format=json&apiKey=${GEOAPIFY_API_KEY}&lang=vi&filter=countrycode:vn&bias=countrycode:vn&limit=10`
      );
      
      const data = await response.json();
      
      if (data.results) {
        // Xử lý và format địa chỉ trước khi hiển thị gợi ý
        const formattedSuggestions = data.results.map(result => ({
          ...result,
          formatted: [
            result.housenumber,
            result.street,
            result.district,
            result.city,
            result.country
          ].filter(Boolean).join(', ')
        }));
        
        setAddressSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  const handleSelectAddress = async (suggestion) => {
    const { lat, lon } = suggestion;
    const selectedPosition = {
      latitude: lat,
      longitude: lon
    };
    
    // Tạo địa chỉ đầy đủ từ các thành phần
    const fullAddress = [
      suggestion.housenumber,
      suggestion.street,
      suggestion.district,
      suggestion.city,
      suggestion.country
    ].filter(Boolean).join(', ');
    
    setCurrentPosition(selectedPosition);
    setAddress(fullAddress);
    setShowSuggestions(false);
  };

  const handleOrder = async () => {
    if (!currentPosition || !address) {
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ trước khi xác nhận');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Thông báo', 'Địa chỉ không hợp lệ');
      return;
    }
    
    if (userLogin == null) {
      Alert.alert(
        'Thông báo', 
        'Bạn phải đăng nhập để xác nhận vị trí',
        [
          {
            text: 'Trở lại',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    try {
      const userEmail = userLogin.email.toLowerCase();
      
      await firestore()
        .collection('USERS')
        .doc(userEmail)
        .update({
          address: address,
        });
        
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ thành công', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('RouterServiceCustomer')
        }
      ]);
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ. Vui lòng thử lại.');
    }
  };
//602 đường nguyễn văn trỗi phường hiệp thành thủ dầu một bình dương việt nam

  const formatAddress = (addressData) => {
    // Ưu tiên lấy thông tin chi tiết nếu có
    const detailedAddress = [
      addressData.housenumber,
      addressData.street,
      addressData.district,
      addressData.city,
      addressData.country
    ].filter(Boolean);

    // Nếu không có thông tin chi tiết, lấy thông tin từ formatted_address
    if (detailedAddress.length <= 2) { // Chỉ có city và country
      return addressData.formatted_address || addressData.formatted;
    }

    return detailedAddress.join(', ');
  };

  return (
    <View style={{ 
      flex: 1,
      backgroundColor: 'white',
    }}>
      <View style={{ margin: 10 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          borderColor: 'gray',
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: showSuggestions ? 0 : 10,
        }}>
          <TextInput
            style={{
              height: 40,
              flex: 1,
              paddingLeft: 8,
              color: 'black'
            }}
            placeholder="Nhập địa chỉ"
            value={address}
            onChangeText={(text) => getAddressSuggestions(text)}
            onFocus={() => {
              // Hiện lại đề xuất khi focus vào TextInput và có text
              if (address.length >= 2) {
                setShowSuggestions(true);
              }
            }}
          />
          {address.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setAddress('');
                setAddressSuggestions([]);
                setShowSuggestions(false);
              }}
              style={{
                padding: 8,
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: 'gray',
                fontWeight: 'bold'
              }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Danh sách gợi ý địa chỉ */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={{
            maxHeight: 200,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'gray',
            marginBottom: 10,
            borderRadius: 5
          }}>
            {addressSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee'
                }}
                onPress={() => handleSelectAddress(suggestion)}
              >
                <Text>{suggestion.formatted}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
  <TouchableOpacity
    style={{
      backgroundColor: '#007AFF',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 10
    }}
    onPress={() => getCoordinatesFromAddress(address)}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Tìm kiếm vị trí</Text>
  </TouchableOpacity>
        
      </View>
      
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 10.980724795723445,
          longitude: 106.67531866840427,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: 70,
          left: 0
        }}
        onPress={handleMapPress}
      >
        {/* Thêm Marker cho vị trí hiện tại */}
        {currentPosition && (
          <Marker
            coordinate={currentPosition}
            title={"Vị trí hiện tại"}
            description={address}
            pinColor="red"
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title={"Điểm đến"}
            pinColor="blue"
          />
        )}

        {currentPosition && destination && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Thêm nút xác nhận ở dưới */}
      <View style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 10,
            flex: 1,
            marginRight: 10,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={handleOrder}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold'
          }}>Xác nhận địa chỉ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            width: 45,
            height: 45,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={async () => {
            Geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const currentCoordinate = { latitude, longitude };
                setCurrentPosition(currentCoordinate);

                // Chuyển đổi tọa độ thành địa chỉ cho điểm xuất phát
                try {
                  const response = await fetch(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=vi`
                  );
                  const data = await response.json();
                  
                  if (data.features && data.features.length > 0) {
                    const addressData = data.features[0].properties;
                    // Tạo địa chỉ đầy đủ từ d liệu
                    const formattedAddress = [
                      addressData.housenumber,
                      addressData.street,
                      addressData.district,
                      addressData.city,
                      addressData.country
                    ].filter(Boolean).join(', ');
                    
                    setAddress(formattedAddress); // Cập nhật ô nhập địa chỉ
                  }
                } catch (error) {
                  console.log(error);
                  Alert.alert('Error', 'Không thể lấy địa chỉ. Vui lòng thử lại.');
                }
              },
              (error) => {
                console.log(error);
                Alert.alert('Error', 'Không thể lấy vị trí. Vui lòng thử lại.');
              },
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
          }}
        >
          <Image 
            source={require('../assets/place.png')} 
            style={{
              width: 24,
              height: 24,
              
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default Map;