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
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDoctors().then(() => setRefreshing(false));
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

    // Initial load and Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDoctors(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchDoctors = async (search = '') => {
        try {
            if (!refreshing && !search && doctors.length === 0) setLoading(true);
            if (search) setIsSearching(true);
            
            const res = await api.get(`/doctors?search=${encodeURIComponent(search)}`);
            setDoctors(res.data);
            
            // Reapply category filter immediately if one is selected
            let result = res.data;
            if (selectedCategory !== 'All') {
                result = result.filter((doc: any) =>
                    doc.specialty && doc.specialty.toLowerCase().includes(selectedCategory.toLowerCase())
                );
            }
            setFilteredDoctors(result);
        } catch (error) {
            console.error("Fetch doctors error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsSearching(false);
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
            {/* SEARCH BAR */}
            <View className={`bg-[#00695C] pt-[50px] pb-4 px-5 rounded-b-[20px] shadow-sm z-10 ${Platform.OS === 'android' ? 'pt-12' : ''}`}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-[22px] font-bold text-white">Find a Consultant</Text>
                </View>
                
                <View className="bg-white/10 p-3 rounded-xl flex-row items-center border border-white/20">
                    <FontAwesome5 name="search" size={16} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        className="flex-1 ml-3 text-[15px] text-white"
                        placeholder="Search doctors, specialties..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {isSearching ? (
                        <ActivityIndicator size="small" color="#fff" style={{ padding: 4 }} />
                    ) : searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <FontAwesome5 name="times-circle" size={16} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* CATEGORY BAR */}
            <View className="py-4 bg-[#F5F7FA] border-b border-[#E0E0E0] z-0">
                <FlatList
                        data={CATEGORIES}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
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
