import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, ScrollView, SafeAreaView, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from 'axios';
import API_CONFIG from "../api";
import Icon from 'react-native-vector-icons/Feather';

const BASE_URL = API_CONFIG.BASE_URL;

// Hàm chuẩn hóa link ảnh
const normalizeUrl = (base, path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Luôn thêm /storage/ nếu chưa có
    let cleanPath = path;
    if (!cleanPath.startsWith('/storage')) {
        cleanPath = '/storage/' + cleanPath.replace(/^\/?/, '');
    }
    const baseClean = base.endsWith('/') ? base.slice(0, -1) : base;
    return baseClean + cleanPath;
};

const PostDetail = ({ navigation, route }) => {
    const { id } = route.params || {};
    const [post, setPost] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTextLong, setIsTextLong] = useState(false);

    useEffect(() => {
        const fetchPostDetails = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`${BASE_URL}/api/posts/${id}`);
                if (response.data.success) {
                    setPost(response.data.data);
                } else {
                    console.error("Failed to fetch post:", response.data.message);
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post details:", error);
                setPost(null);
            }
        };

        fetchPostDetails();
    }, [id]);
    
    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const contentText = post?.content || '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'\u2039'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{post?.title || 'Chi tiết'}</Text>
                <View style={{width: 24}} />
            </View>

            {!post ? (
                <Text style={styles.loadingText}>Đang tải...</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {post.image_url && (
                        <Image 
                            source={{ uri: normalizeUrl(BASE_URL, post.image_url) }}
                            style={styles.image}
                        />
                    )}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.categoryText}>TIN TỨC</Text>
                        <Text style={styles.title}>{post.title}</Text>
                        <View style={styles.dateContainer}>
                            
                            <Text style={styles.date}>{formatDate(post.created_at)}</Text>
                        </View>
                        <View style={styles.contentWrapper}>
                            <Text 
                                style={styles.content}
                            >
                                {contentText}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 50,
        color: '#666',
    },
    scrollContainer: {
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
    },
    detailsContainer: {
        padding: 20,
        backgroundColor: '#fff',
    },
    categoryText: {
        color: '#003366',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#B99A7B',
        textAlign: 'center',
        lineHeight: 30,
    },
    backButtonText: {
        fontSize: 32,
        color: '#000',
        fontWeight: 'bold',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    contentWrapper: {
        padding: 20,
        backgroundColor: '#F9F6F2',
        borderRadius: 12,
    },
    content: {
        fontSize: 16,
        lineHeight: 26,
        color: '#444',
        textAlign: 'justify',
    },
    seeMoreButtonContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    seeMoreButton: {
        backgroundColor: '#B99A7B',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    seeMoreText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default PostDetail;
