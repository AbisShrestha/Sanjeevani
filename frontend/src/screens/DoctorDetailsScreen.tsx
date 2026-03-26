import React from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildImageUri } from '../utils/image';

const DoctorDetailsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    // Using props instead of hooks
    const { doctor } = route.params;
    const displayImage = buildImageUri(doctor?.image, 'https://via.placeholder.com/150');

    const handleBook = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert(
                'Login Required',
                'You must be logged in to book an appointment.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
            return;
        }
        navigation.navigate('BookAppointment', { doctor });
    };

    return (
        <View className="flex-1 bg-[#F7F9FC]">
            <StatusBar barStyle="light-content" backgroundColor="#00695C" />

            {/* HEADER */}
            <View className={`bg-[#00695C] px-5 pb-5 flex-row justify-between items-center ${Platform.OS === 'ios' ? 'pt-12' : 'pt-10'}`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">Doctor Profile</Text>
                <View className="w-5" />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* DOCTOR HEADER CARD */}
                <View className="bg-white items-center p-6 mb-3 shadow-sm rounded-b-[24px]">
                    <Image
                        source={{ uri: displayImage || 'https://via.placeholder.com/150' }}
                        className="w-[110px] h-[110px] rounded-full mb-4 border-4 border-[#E0F2F1]"
                    />
                    <Text className="text-[22px] font-bold text-[#333] mb-1">{doctor.name}</Text>
                    <Text className="text-base text-[#00695C] font-semibold mb-3 tracking-wide">{doctor.specialty}</Text>

                    <View className="flex-row items-center bg-[#FFF8E1] px-3 py-1.5 rounded-full">
                        <Text className="text-[#FFB300] font-bold text-sm">{doctor.rating || 5.0} ★</Text>
                        <Text className="text-[#757575] text-xs ml-1">(120+ Reviews)</Text>
                    </View>
                </View>

                {/* STATS */}
                <View className="flex-row bg-white py-5 mb-3 justify-evenly shadow-sm mx-4 rounded-xl border border-[#f0f0f0]">
                    <View className="items-center w-[30%]">
                        <View className="w-10 h-10 bg-[#E0F2F1] rounded-full items-center justify-center mb-2">
                            <FontAwesome5 name="user-friends" size={18} color="#00695C" />
                        </View>
                        <Text className="text-lg font-bold text-[#333]">500+</Text>
                        <Text className="text-xs text-[#90A4AE]">Patients</Text>
                    </View>

                    <View className="w-[1px] bg-[#EEEEEE] h-[80%]" />

                    <View className="items-center w-[30%]">
                        <View className="w-10 h-10 bg-[#E0F2F1] rounded-full items-center justify-center mb-2">
                            <FontAwesome5 name="briefcase-medical" size={18} color="#00695C" />
                        </View>
                        <Text className="text-lg font-bold text-[#333]">{doctor.experience || '5 Yrs'}</Text>
                        <Text className="text-xs text-[#90A4AE]">Experience</Text>
                    </View>

                    <View className="w-[1px] bg-[#EEEEEE] h-[80%]" />

                    <View className="items-center w-[30%]">
                        <View className="w-10 h-10 bg-[#E0F2F1] rounded-full items-center justify-center mb-2">
                            <FontAwesome5 name="star" size={18} color="#00695C" />
                        </View>
                        <Text className="text-lg font-bold text-[#333]">4.8</Text>
                        <Text className="text-xs text-[#90A4AE]">Rating</Text>
                    </View>
                </View>

                {/* ABOUT SECTION */}
                <View className="bg-white p-5 mb-3 mx-4 rounded-xl shadow-sm border border-[#f0f0f0]">
                    <Text className="text-lg font-bold text-[#37474F] mb-2.5">About Doctor</Text>
                    <Text className="text-[14px] text-[#546E7A] leading-6">
                        Dr. {doctor.name} is a distinguished Ayurvedic practitioner specializing in {doctor.specialty}.
                        With a deep rooted understanding of Doshas and natural remedies, {doctor.name.split(' ')[0]}
                        offers holistic treatments tailored to individual needs.
                    </Text>
                </View>

                {/* AVAILABILITY SECTION */}
                <View className="bg-white p-5 mb-3 mx-4 rounded-xl shadow-sm border border-[#f0f0f0]">
                    <Text className="text-lg font-bold text-[#37474F] mb-3">Availability</Text>
                    <View className="flex-row items-center flex-wrap">
                        <View className="bg-[#E0F2F1] px-3 py-1.5 rounded-lg mr-2 mb-2">
                            <Text className="text-[#00695C] font-bold text-xs">Mon</Text>
                        </View>
                        <View className="bg-[#E0F2F1] px-3 py-1.5 rounded-lg mr-2 mb-2">
                            <Text className="text-[#00695C] font-bold text-xs">Wed</Text>
                        </View>
                        <View className="bg-[#E0F2F1] px-3 py-1.5 rounded-lg mr-2 mb-2">
                            <Text className="text-[#00695C] font-bold text-xs">Fri</Text>
                        </View>
                        <Text className="text-[#546E7A] text-sm ml-auto font-medium">10:00 AM - 05:00 PM</Text>
                    </View>
                </View>
            </ScrollView>

            {/* BOTTOM FOOTER */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 flex-row justify-between items-center shadow-2xl border-t border-[#f0f0f0]">
                <View>
                    <Text className="text-xs text-[#90A4AE] mb-0.5">Consultation Fee</Text>
                    <Text className="text-xl font-bold text-[#263238]">₹500</Text>
                </View>
                <TouchableOpacity
                    className="bg-[#00695C] px-8 py-3.5 rounded-full shadow-lg active:bg-[#004D40]"
                    onPress={handleBook}
                >
                    <Text className="text-white font-bold text-base">Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default DoctorDetailsScreen;
