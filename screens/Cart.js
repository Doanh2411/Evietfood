import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useCart } from "../routers/CartContext"
import { Button } from 'react-native-paper';
import { useMyContextProvider } from "../index"
import { useNavigation } from '@react-navigation/native';
import firestore from "@react-native-firebase/firestore"
import moment from 'moment';

const Cart = () => {
  const navigation = useNavigation();
  const { cart, removeFromCart, clearCart, updateQuantity, addToCart } = useCart();
  const [controller] = useMyContextProvider();
  const { userLogin } = controller || {}; // Add fallback empty object
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [suggested, setSuggested] = useState([]);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  
  // Check if user is logged in
  

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItemBox}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemTitle}>{item.title?.toUpperCase()}</Text>
        <View style={styles.cartItemRowBetween}>
          <Text style={styles.cartItemPrice}>{formatPrice(item.price * item.quantity)}đ</Text>
          <View style={styles.cartItemQuantityRow}>
            <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.cartItemQtyBtn}>
              <Text style={styles.cartItemQtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.cartItemQtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.cartItemQtyBtn}>
              <Text style={styles.cartItemQtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    // Lấy 3 sản phẩm gợi ý từ firestore (hoặc hardcode nếu không có firestore)
    const fetchSuggest = async () => {
      try {
        const snap = await firestore().collection('Services').limit(3).get();
        setSuggested(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        setSuggested([
          { id: '1', title: 'BÁNH BAO', price: 15000, image: 'https://i.imgur.com/1.png' },
          { id: '2', title: 'MÌ TRỨNG', price: 20000, image: 'https://i.imgur.com/2.png' },
          { id: '3', title: 'CÀ PHÊ ĐEN', price: 15000, image: 'https://i.imgur.com/3.png' },
        ]);
      }
    };
    fetchSuggest();
  }, []);

  const increaseQuantity = (id) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decreaseQuantity = (id) => {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const handleSubmit = () => {
    // Check if user is logged in
    if (!userLogin) {
      Alert.alert(
        "Thông báo",
        "Bạn cần đăng nhập để đặt hàng",
        [
          {
            text: "Đăng nhập",
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
      return;
    }
    
    // Check if the cart is empty
    if (cart.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
      return; // Exit the function if the cart is empty
    }
    
    navigation.navigate('IdentifyCart');
  }

  const renderSuggest = ({ item }) => (
    <View style={styles.similarItem}>
      <Image source={{ uri: item.image }} style={styles.similarImage} />
      <Text style={styles.similarTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.similarPrice}>{formatPrice(item.price)}đ</Text>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#F6F6F6'}}>
      <View style={styles.cartHeaderRow}>
        <View style={styles.cartBadgeWrap}>
          <Text style={styles.cartBadgeText}>Bạn có {totalItems} sản phẩm trong giỏ hàng</Text>
        </View>
      </View>
      <View style={styles.cartTitleRow}>
        <Text style={styles.cartTitle}>Sản phẩm đã chọn</Text>
        <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+ Thêm</Text></TouchableOpacity>
      </View>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingBottom: 10}}
      />
      <View style={styles.suggestSection}>
        <Text style={styles.suggestHeader}>GỢI Ý CHO BẠN</Text>
        <FlatList
          data={suggested}
          renderItem={renderSuggest}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestListContent}
        />
      </View>
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutRow}>
          <Text style={styles.checkoutCount}>{totalItems} sản phẩm</Text>
          <Text style={styles.checkoutTotal}>{formatPrice(total)}đ</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleSubmit}>
          <Text style={styles.checkoutBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
      {/* <TouchableOpacity style={styles.clearCartBtn} onPress={clearCart}>
        <Text style={styles.clearCartBtnText}>Xóa giỏ hàng</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    maxWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 20,
    marginHorizontal: 10,
    color: 'gray'
  },
  removeButton: {
    color: 'red',
  },
  total: {
    flex: 2,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'black'
  },
  clearButton: {
    backgroundColor: 'red',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    fontSize:16,
    color: 'white',
    fontWeight: 'bold',
  },
  fadedText: {
    color: 'gray', // Change color to make it faded
    fontSize: 14,  // Adjust font size if needed
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginVertical: 10,
    paddingTop: 10, // Thêm padding để tạo khoảng cách với viền
  },
  bookButton: {
    flex: 1,
    maxWidth:'35%',
    borderRadius:0,
  },
  cartHeaderRow: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  cartBadgeWrap: {
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  cartBadgeText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 2,
  },
  cartTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  addBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginHorizontal: 10,
  },
  cartItemImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 18,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemTitle: {
    fontSize: 18,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF3B30',
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cartItemQtyBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cartItemQtyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
  },
  suggestSection: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    marginLeft: 18,
    color: '#222',
    alignSelf: 'flex-start',
  },
  suggestListContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 12,
  },
  similarItem: {
    width: 120,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  similarImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  similarTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    textAlign: 'center',
  },
  similarPrice: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkoutBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkoutCount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111',
  },
  checkoutTotal: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#111',
  },
  checkoutBtn: {
    backgroundColor: '#ED2B36',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 0,
  },
  checkoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  clearCartBtn: {
    backgroundColor: '#ED2B36',
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 40,
    marginTop: 10,
    borderRadius: 10,
  },
  clearCartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Cart;
