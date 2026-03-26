import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, Platform, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAllInsightsPublic } from '../services/doctorService';
import dayjs from 'dayjs';

interface Insight {
    id: number;
    title: string;
    content: string;
    image_url: string;
    doctor_name: string;
    created_at: string;
}

const CommunityScreen = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const data = await getAllInsightsPublic();
            setInsights(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Insight }) => (
        <View className="bg-white rounded-[16px] mb-5 overflow-hidden shadow-sm elevation-2">
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} className="w-full h-48 bg-gray-200" />
            ) : null}
            <View className="p-5">
                <Text className="text-[18px] font-bold text-[#333] mb-1">{item.title}</Text>
                <View className="flex-row items-center mb-4">
                    <FontAwesome5 name="user-md" size={12} color="#00695C" />
                    <Text className="text-[#00695C] font-semibold text-xs ml-2">Dr. {item.doctor_name}</Text>
                    <Text className="text-gray-400 text-xs ml-3">• {dayjs(item.created_at).format('MMM D, YYYY')}</Text>
                </View>
                <Text className="text-[#555] text-[15px] leading-6">{item.content}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View className={`bg-[#00695C] pt-12 pb-6 px-6 rounded-b-[24px] shadow-md z-10 ${Platform.OS === 'android' ? 'pt-12' : ''}`}>
                <Text className="text-2xl font-bold text-white tracking-wide">Sanjeevani Insights</Text>
                <Text className="text-[#B2DFDB] mt-1 text-base">Daily Health Wisdom from Doctors</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00695C" />
                </View>
            ) : (
                <FlatList
                    data={insights}
                    keyExtractor={(item: any) => (item.id || Math.random()).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingTop: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20 px-10">
                            <View className="w-20 h-20 bg-[#E0F2F1] rounded-full justify-center items-center mb-6 shadow-sm">
                                <FontAwesome5 name="book-reader" size={40} color="#00695C" />
                            </View>
                            <Text className="text-xl font-bold text-[#37474F] mb-3 text-center">No Insights Yet</Text>
                            <Text className="text-base text-[#78909C] text-center leading-6">
                                Check back soon. Our doctors are preparing curated Ayurvedic articles and daily tips.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

export default CommunityScreen;
