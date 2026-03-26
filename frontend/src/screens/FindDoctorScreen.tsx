import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Platform,
    RefreshControl
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { buildImageUri } from '../utils/image';

const CATEGORIES = ['All', 'General', 'Skin Specialist', 'Bones & Joints', 'Digestive', "Women's Health", 'Panchakarma'];

const FindDoctorScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const [doctors, setDoctors] = useState<any[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDoctors().then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, []);

    // Filter when category changes
    useEffect(() => {
        let result = doctors;

        // Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(doc =>
                doc.specialty && doc.specialty.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        setFilteredDoctors(result);
    }, [selectedCategory, doctors]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
            setFilteredDoctors(res.data);
        } catch (error) {
            console.error("Fetch doctors error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        // Helper to construct image URL
        const displayImage = buildImageUri(item.image, 'https://via.placeholder.com/150');

        return (
            <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center border border-[#F5F5F5]"
                onPress={() => navigation.navigate('DoctorDetails', { doctor: item })}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: displayImage }}
                    className="w-[70px] h-[70px] rounded-full bg-[#F5F5F5]"
                />
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-[#37474F]">{item.name}</Text>
                    <Text className="text-[#00695C] font-semibold text-sm">{item.specialty}</Text>
                    <View className="flex-row items-center mt-1">
                        <FontAwesome5 name="hospital" size={12} color="#90A4AE" style={{ marginRight: 5 }} />
                        <Text className="text-[#78909C] text-xs">{item.hospital || 'Sanjeevani Clinic'}</Text>
                    </View>
                </View>
                <View className="bg-[#E0F2F1] p-2 rounded-full">
                    <FontAwesome5 name="chevron-right" size={14} color="#00695C" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header */}
            <View className={`bg-white shadow-sm flex-row items-center px-5 py-4 ${Platform.OS === 'ios' ? 'pt-12' : ''} mb-2`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#37474F" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[#37474F] ml-4">Find A Doctor</Text>
            </View>

            <View className="px-4 pt-4">
                {/* Categories */}
                <View className="h-[45px] mb-2">
                    <FlatList
                        data={CATEGORIES}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`px-5 py-2 rounded-full mr-2.5 border ${selectedCategory === item ? 'bg-[#00695C] border-[#00695C]' : 'bg-white border-[#E0E0E0]'}`}
                                onPress={() => setSelectedCategory(item)}
                            >
                                <Text className={`${selectedCategory === item ? 'text-white font-bold' : 'text-[#666]'}`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item}
                    />
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00695C" />
                    <Text className="text-[#78909C] mt-4">Loading experts...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDoctors}
                    renderItem={renderItem}
                    keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00695C']} />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-12 px-10">
                            <View className="w-24 h-24 bg-[#E0F2F1] rounded-full items-center justify-center mb-6 shadow-sm">
                                <FontAwesome5 name="user-md" size={40} color="#00695C" />
                            </View>
                            <Text className="text-xl font-bold text-[#37474F] mb-2 text-center">No Doctors Found</Text>
                            <Text className="text-[#78909C] text-center leading-5 mb-8">
                                We couldn't find any experts in this category. Try selecting another Ayurvedic specialty!
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default FindDoctorScreen;
