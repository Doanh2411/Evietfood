import React, { useState, useEffect }  from 'react';
import {View,Text,TextInput,StyleSheet,TouchableOpacity,ScrollView, Alert, Image} from 'react-native';
import { useMyContextProvider } from "../index";
import moment from 'moment';
import { useCart } from "../routers/CartContext"
import firestore from "@react-native-firebase/firestore"
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const initialDeliveryInfo = {
  fullName: '',
  phone: '',
  address: '',
  paymentMethod: 'unpaid',
  note: '',
};

const formatPrice = (price) => {
  if (!price) return "0";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const IdentifyCart = ({ navigation }) => {
    const [controller] = useMyContextProvider();
    const { userLogin } = controller;
    const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
    const customerId = userLogin?.phone || "";
    const timestamp = moment().format('YYMMDDHHmmss');
    const app_trans_id = `${timestamp}_${customerId}`;
    const [datetime, setDatetime] = useState(new Date());
    const newId = userLogin.phone;
    const APPOINTMENTs = firestore().collection("Appointments");
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const [deliveryInfo, setDeliveryInfo] = useState(initialDeliveryInfo);

  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showPhoneSuggestion, setShowPhoneSuggestion] = useState(false);
  const [showAddressSuggestion, setShowAddressSuggestion] = useState(false);
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);

  const handleFullNamePress = () => {
    if (userLogin?.fullName) {
      setShowSuggestion(true);
    }
  };

  const handlePhonePress = () => {
    if (userLogin?.phone) {
      setShowPhoneSuggestion(true);
    }
  };

  const handleAddressPress = () => {
    if (userLogin?.address) {
      setShowAddressSuggestion(true);
    }
  };

  const handleSubmit = () => {
    if (deliveryInfo.fullName === '' ) {
      Alert.alert("Thông báo", "Vui lòng điền tên khách hàng");
      return;
    }else
    if (deliveryInfo.phone === '' ) {
      Alert.alert("Thông báo", "Vui lòng điền số điện thoại");
      return;
    }else
    if (deliveryInfo.address === '' ) {
      Alert.alert("Thông báo", "Vui lòng điền địa chỉ giao hàng");
      return;
    }
    Alert.alert(
          "Xác nhận đặt hàng",
          "Bạn có chắc chắn muốn đặt đơn hàng này?",
          [
            {
              text: "Hủy",
              style: "cancel"
            },
            {
              text: "Đặt hàng",
              onPress: () => {
                const services = cart.map(item => ({
                  title: item.title,
                  quantity: item.quantity,
                  price:item.price,
                }));
                
    
                APPOINTMENTs
                  .add({
                    id: app_trans_id,
                    phone: userLogin.phone,
                    fullName: deliveryInfo.fullName,
                    address: deliveryInfo.address,
                    services,
                    totalPrice: total,
                    contactPhone: deliveryInfo.phone,
                    datetime,
                    state: "new",
                    appointment: deliveryInfo.paymentMethod,
                    note: deliveryInfo.note
                  })
                  .then(r => {
                    APPOINTMENTs.doc(r.id).update({ id: app_trans_id });
                  });
                  Alert.alert(
                    "Thành công",
                    "Sản phẩm đã được đặt thành công",
                    [{ 
                      text: "OK",
                      onPress: () => {
                        // Reset form
                        navigation.navigate('Cart');
                      }
                    }]
                  );
      
                  clearCart();
              }
            }
          ]
        );
  };

  // Giả lập danh sách khuyến mãi
  const promotions = [
    { id: 1, text: 'ƯU ĐÃI 30K CHO ĐƠN TỐI THIỂU 60K', time: '20/05/2025 23:59' },
    { id: 2, text: 'ƯU ĐÃI 50K CHO ĐƠN TỐI THIỂU 100K', time: '20/05/2025 21:30' },
  ];
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const shippingFee = 0;

  return (
    <>
    <ScrollView style={{flex: 1, backgroundColor: '#fff'}} contentContainerStyle={{paddingBottom: 120}}>
        {/* Khuyến mãi */}
        <View style={styles.sectionBox}>
            <Text style={styles.infoLabel}>Khuyến mãi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 8}}>
              {promotions.map(p => (
                <View key={p.id} style={styles.promoBox}>
                  <Text style={styles.promoText}>{p.text}</Text>
                  <Text style={styles.promoTime}>{p.time}</Text>
                </View>
              ))}
            </ScrollView>
        </View>
        {/* Thông tin nhận hàng */}
        <View style={styles.sectionBox}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thông tin nhận hàng</Text>
                <TouchableOpacity><Text style={styles.infoChange}>Thay đổi</Text></TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoName}>{userLogin?.fullName} <Text style={styles.infoPhone}>| {userLogin?.phone}</Text></Text>
            </View>
            
        </View>
        {/* Thời gian giao hàng */}
        <View style={styles.sectionBoxTime}>
            <Text style={styles.infoLabel}>Thời gian giao hàng</Text>
            <Text style={styles.deliveryTime}>Giao ngay - 10:00 đến 10:30 - 14/05/2025</Text>
        </View>
        {/* Tóm tắt đơn hàng */}
        <View style={styles.sectionBox}>
            <View style={styles.orderSummaryRow}>
                <Text style={styles.infoLabel}>Tóm tắt đơn hàng</Text>
                <TouchableOpacity><Text style={styles.infoChange}>Thêm</Text></TouchableOpacity>
            </View>
            {cart.map(item => (
                <View key={item.id} style={styles.cartItemBox}>
                    <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                    <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemTitle}>{item.title?.toUpperCase()}</Text>
                        <View style={styles.cartItemRowBetween}>
                            <Text style={styles.cartItemPrice}>{formatPrice(item.price * item.quantity)}đ</Text>
                            <View style={styles.cartItemQuantityRow}>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={styles.cartItemQtyBtn}>
                                    <Text style={styles.cartItemQtyBtnText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.cartItemQtyText}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.cartItemQtyBtn}>
                                    <Text style={styles.cartItemQtyBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>
        {/* Phương thức thanh toán */}
        <View style={styles.sectionBox}>
            <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
            <View style={styles.paymentOptionRow}>
              <TouchableOpacity style={styles.radioRow}>
                <View style={styles.radioOuter}>
                  {deliveryInfo.paymentMethod === 'unpaid' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentText}>Thanh toán tiền mặt khi nhận hàng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioRow}>
                <View style={styles.radioOuter}>
                  {deliveryInfo.paymentMethod === 'vnpay' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentText}>Thanh toán ngân hàng qua VNPAY</Text>
              </TouchableOpacity>
            </View>
        </View>
        {/* Tổng kết đơn hàng */}
        <View style={styles.sectionBox}>
            <Text style={styles.infoLabel}>Tổng cộng ({totalItems} món)</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thành tiền</Text>
              <Text style={styles.summaryValue}>{formatPrice(total)}đ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao</Text>
              <Text style={styles.summaryValue}>{shippingFee === 0 ? '0đ' : formatPrice(shippingFee) + 'đ'}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotalLabel}>Tổng tiền:</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(total + shippingFee)}đ</Text>
            </View>
        </View>
    </ScrollView>
    {/* Thanh thanh toán cố định dưới cùng */}
    <View style={styles.fixedBar}>
      <View style={styles.fixedBarRow}>
        <Text style={styles.fixedBarCount}>{totalItems} sản phẩm</Text>
        <Text style={styles.fixedBarTotal}>{formatPrice(total + shippingFee)}đ</Text>
      </View>
      <TouchableOpacity style={styles.fixedBarBtn} onPress={handleSubmit}>
        <Text style={styles.fixedBarBtnText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 30,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestion: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  suggestionContent: {
    padding: 12,
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  paymentText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: -10,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  paymentMessage: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    
    marginHorizontal: 12,
    marginTop: 16,
    padding: 10,
  },
  sectionBoxTime: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 0,
    marginHorizontal: 12,
    marginTop: 16,
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  infoChange: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  infoPhone: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  infoInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#F7F7F7',
    color: '#222',
    marginTop: 2,
  },
  deliveryTime: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#B3D1FF',
    padding: 12,
    marginVertical: 10,
    marginHorizontal: 0,
  },
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginRight: 14,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cartItemRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 10,
  },
  cartItemQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
    borderWidth: 0,
  },
  cartItemQtyBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cartItemQtyBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartItemQtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
  },
  promoBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D1FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    minWidth: 180,
  },
  promoText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 13,
  },
  promoTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  paymentOptionRow: {
    marginTop: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#B3D1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 15,
  },
  summaryValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: 'bold',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  summaryTotalLabel: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryTotalValue: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 18,
  },
  fixedBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  fixedBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fixedBarCount: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#111',
  },
  fixedBarTotal: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#ED2B36',
  },
  fixedBarBtn: {
    backgroundColor: '#ED2B36',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
  },
  fixedBarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default IdentifyCart;
