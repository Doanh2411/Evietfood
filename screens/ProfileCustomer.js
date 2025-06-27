import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { logout, useMyContextProvider } from "../index";
import firestore from "@react-native-firebase/firestore";

const ProfileCustomer = ({ navigation }) => {
    const [controller, dispatch] = useMyContextProvider();
    const { userLogin } = controller || {};
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userLogin) {
            navigation.navigate('Login');
        }
    }, [userLogin, navigation]);

    useEffect(() => {
        if (!userLogin || !userLogin.phone) return;
        const unsubscribe = firestore()
            .collection('USERS')
            .where('phone', '==', userLogin.phone)
            .onSnapshot(querySnapshot => {
                if (!querySnapshot.empty) {
                    setUser(querySnapshot.docs[0].data());
                }
            });
        return () => unsubscribe();
    }, [userLogin]);

    const handleLogout = () => {
        logout(dispatch);
        navigation.navigate("Login");
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBg}>
                <TouchableOpacity style={styles.settingBtn} onPress={() => navigation.navigate('Settings')}> 
                    <Image source={require('../assets/setting.png')} style={{ width: 24, height: 24, tintColor: '#fff' }} />
                </TouchableOpacity>
            </View>
            <View style={styles.avatarAbsoluteWrapper}>
                <View style={styles.avatarBox}>
                    <Image source={require('../assets/canhcut.jpg')} style={{width: 90, height: 90, borderRadius: 20}} />
                </View>
            </View>
            <View style={styles.profileCard}>
                <Text style={styles.inputLabel}>Tên</Text>
                <TextInput
                    style={styles.input}
                    value={"Mr Van"}
                    editable={false}
                />
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    value={user.phone || ''}
                    editable={false}
                />
                {/* <Text style={styles.inputLabel}>Điạ chỉ giao hàng</Text>
                <TextInput
                    style={styles.input}
                    value={user.address || ''}
                    editable={false}
                /> */}
                <Text style={styles.inputLabel}>Password <Text style={{fontSize: 12}}>🔒</Text></Text>
                <TextInput
                    style={styles.input}
                    value={user.password ? '*'.repeat(user.password.length) : ''}
                    secureTextEntry
                    editable={false}
                />
                <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('PaymentDetail')}>
                    <Text style={styles.rowText}>Chi tiết thanh toán</Text>
                    <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowItem} onPress={() => navigation.navigate('OrderHistory')}>
                    <Text style={styles.rowText}>Lịch sử đơn hàng</Text>
                    <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                        <Text style={styles.editBtnText}>Sửa hồ sơ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBg: {
        height: 120,
        backgroundColor: '#FF3B30',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 0,
    },
    settingBtn: {
        position: 'absolute',
        top: 40,
        right: 24,
        zIndex: 2,
    },
    avatarAbsoluteWrapper: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    avatarBox: {
        width: 90,
        height: 90,
        borderRadius: 20,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginHorizontal: 16,
        marginTop: 60,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 2,
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        marginBottom: 6,
        fontSize: 16,
        borderWidth: 0,
        color: '#222',
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 8,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    rowText: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    arrowIcon: {
        fontSize: 22,
        color: '#FF9800',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    editBtn: {
        flex: 1,
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginRight: 8,
    },
    editBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutBtn: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF3B30',
        marginLeft: 8,
    },
    logoutBtnText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileCustomer;
