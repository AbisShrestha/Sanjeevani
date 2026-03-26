import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
    Image,
    RefreshControl,
    Platform,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { buildImageUri } from '../utils/image';

const AdminDoctorListScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchDoctors();
        }, [])
    );

    const [searchText, setSearchText] = useState('');

    const fetchDoctors = async (search = '') => {
        try {
            // Only show full screen loader on first load, not during refresh
            if (!refreshing && !search && doctors.length === 0) {
                setLoading(true);
            }
            if (search) setIsSearching(true);
            const res = await api.get(`/doctors?search=${encodeURIComponent(search)}`);
            setDoctors(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsSearching(false);
        }
    };

    // Search effect (debounced)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDoctors(searchText);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDoctors(searchText);
    };

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            "Delete Doctor",
            `Are you sure you want to remove ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/doctors/${id}`);
                            fetchDoctors(searchText); // Refresh
                        } catch (err) {
                            Alert.alert("Error", "Could not delete.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const imageUri = buildImageUri(item.image, 'https://via.placeholder.com/150');
        return (
            <TouchableOpacity
                className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AdminEditDoctor', { doctor: item })}
            >
                <Image
                    source={{ uri: imageUri || 'https://via.placeholder.com/150' }}
                    className="w-[50px] h-[50px] rounded-full bg-[#eee]"
                />
                <View className="flex-1 ml-4 justify-center">
                    <Text className="text-base font-bold text-[#333]">{item.name}</Text>
                    <Text className="text-xs text-[#666] mt-0.5">{item.specialty} | {item.experience}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2.5 bg-[#FFEBEE] rounded-lg">
                    <FontAwesome5 name="trash" size={14} color="#D32F2F" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* SEARCH BAR */}
            <View className="bg-white p-3 mx-4 mt-4 mb-2 rounded-xl flex-row items-center shadow-sm border border-[#eee]">
                <FontAwesome5 name="search" size={16} color="#999" />
                <TextInput
                    className="flex-1 ml-3 text-[15px] text-[#333]"
                    placeholder="Search doctors..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {isSearching ? (
                    <ActivityIndicator size="small" color="#2E7D32" style={{ padding: 4 }} />
                ) : searchText ? (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <FontAwesome5 name="times-circle" size={16} color="#ccc" />
                    </TouchableOpacity>
                ) : null}
            </View>

            <FlatList
                data={doctors}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center mt-12">
                            <View className="bg-[#E8F5E9] w-16 h-16 rounded-full items-center justify-center mb-4">
                                <FontAwesome5 name="user-md" size={30} color="#2E7D32" />
                            </View>
                            <Text className="text-[#90A4AE] text-lg font-medium">
                                {searchText ? 'No doctors match your search' : 'No doctors found'}
                            </Text>
                            <Text className="text-[#B0BEC5] text-sm mt-1">
                                {searchText ? 'Try a different name or specialty' : 'Tap + to add a new doctor.'}
                            </Text>
                        </View>
                    ) : (
                        <View className="mt-12">
                            <ActivityIndicator size="large" color="#2E7D32" />
                        </View>
                    )
                }
            />

            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#2E7D32] justify-center items-center shadow-lg elevation-6"
                onPress={() => navigation.navigate('AdminAddDoctor')}
            >
                <FontAwesome5 name="plus" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

export default AdminDoctorListScreen;
