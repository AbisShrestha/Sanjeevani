import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { buildImageUri } from '../utils/image';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../services/fileUploadService';

interface Insight {
    id: number;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    doctor_name?: string;
}

const AdminManageInsightsScreen = ({ navigation }: { navigation: any }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Edit modal state
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingInsight, setEditingInsight] = useState<Insight | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchInsights = async () => {
        try {
            const res = await api.get('/doctor-features/insights/all');
            setInsights(res.data);
        } catch (error) {
            console.error('Fetch insights error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchInsights();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    const handleDelete = (id: number, title: string) => {
        Alert.alert(
            'Delete Insight',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/doctor-features/insights/admin/${id}`);
                            Alert.alert('Deleted', 'Insight removed successfully.');
                            fetchInsights();
                        } catch (err) {
                            Alert.alert('Error', 'Could not delete insight.');
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = (insight: Insight) => {
        setEditingInsight(insight);
        setEditTitle(insight.title);
        setEditContent(insight.content);
        setEditImageUrl(insight.image_url || '');
        setEditModalVisible(true);
    };

    const pickEditImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                const url = await uploadImage(result.assets[0]);
                if (url) setEditImageUrl(url);
            } catch {
                Alert.alert('Error', 'Failed to upload image.');
            }
        }
    };

    const handleSaveEdit = async () => {
        if (!editTitle || !editContent) {
            Alert.alert('Error', 'Title and content are required.');
            return;
        }
        if (!editingInsight) return;

        try {
            setSaving(true);
            await api.put(`/doctor-features/insights/${editingInsight.id}`, {
                title: editTitle,
                content: editContent,
                imageUrl: editImageUrl,
            });
            Alert.alert('Success', 'Insight updated successfully.');
            setEditModalVisible(false);
            fetchInsights();
        } catch (err) {
            Alert.alert('Error', 'Failed to update insight.');
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: Insight }) => {
        const imageUri = buildImageUri(item.image_url);

        return (
            <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-[#f0f0f0]">
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri! }}
                        className="w-full h-[160px]"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-[100px] bg-[#E8F5E9] justify-center items-center">
                        <FontAwesome5 name="newspaper" size={36} color="#2E7D32" />
                    </View>
                )}

                <View className="p-4">
                    <Text className="text-[17px] font-bold text-[#333] mb-1" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-[13px] text-[#999] mb-2">
                        By {item.doctor_name || 'Unknown'} | {dayjs(item.created_at).format('MMM D, YYYY')}
                    </Text>
                    <Text className="text-[13px] text-[#666] leading-5" numberOfLines={3}>
                        {item.content}
                    </Text>

                    <View className="flex-row justify-end mt-4 pt-3 border-t border-[#f0f0f0]">
                        <TouchableOpacity
                            className="flex-row items-center mr-5"
                            onPress={() => openEditModal(item)}
                        >
                            <FontAwesome5 name="edit" size={14} color="#1976D2" />
                            <Text className="ml-1.5 text-[#1976D2] font-semibold">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => handleDelete(item.id, item.title)}
                        >
                            <FontAwesome5 name="trash" size={14} color="#D32F2F" />
                            <Text className="ml-1.5 text-[#D32F2F] font-semibold">Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            <FlatList
                data={insights}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center mt-16">
                            <View className="bg-[#E8F5E9] w-20 h-20 rounded-full items-center justify-center mb-5">
                                <FontAwesome5 name="newspaper" size={36} color="#2E7D32" />
                            </View>
                            <Text className="text-[#90A4AE] text-lg font-medium">No Insights Yet</Text>
                            <Text className="text-[#B0BEC5] text-sm mt-1 text-center px-10">
                                Insights published by doctors will appear here for you to manage.
                            </Text>
                        </View>
                    ) : null
                }
            />

            {loading && (
                <View className="absolute inset-0 justify-center items-center">
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            )}

            {/* EDIT MODAL */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View className="flex-1 bg-[#F5F7FA]">
                        {/* Modal Header */}
                        <View className={`bg-white px-5 pb-4 flex-row justify-between items-center border-b border-[#eee] shadow-sm ${Platform.OS === 'ios' ? 'pt-14' : 'pt-5'}`}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Text className="text-[#999] text-base">Cancel</Text>
                            </TouchableOpacity>
                            <Text className="text-lg font-bold text-[#333]">Edit Insight</Text>
                            <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator size="small" color="#2E7D32" />
                                ) : (
                                    <Text className="text-[#2E7D32] text-base font-bold">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
                            {/* Image Preview */}
                            <TouchableOpacity onPress={pickEditImage} className="mb-5">
                                {editImageUrl ? (
                                    <Image
                                        source={{ uri: buildImageUri(editImageUrl) || editImageUrl }}
                                        className="w-full h-[180px] rounded-2xl"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-[140px] bg-[#E8F5E9] rounded-2xl justify-center items-center">
                                        <FontAwesome5 name="camera" size={28} color="#2E7D32" />
                                        <Text className="text-[#2E7D32] mt-2 font-medium">Tap to change image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Title</Text>
                            <TextInput
                                className="bg-white p-3 rounded-xl text-[#333] text-base mb-4 border border-[#eee]"
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Insight title"
                            />

                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Content</Text>
                            <TextInput
                                className="bg-white p-3 rounded-xl text-[#333] text-base h-[200px] border border-[#eee]"
                                value={editContent}
                                onChangeText={setEditContent}
                                placeholder="Write the insight content..."
                                multiline
                                textAlignVertical="top"
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default AdminManageInsightsScreen;
