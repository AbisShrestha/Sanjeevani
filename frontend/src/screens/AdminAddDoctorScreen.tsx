import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
    Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { buildImageUri } from '../utils/image';

const AdminAddDoctorScreen = ({ navigation }: { navigation: any }) => {
    // Using props instead of useNavigation hook
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [experience, setExperience] = useState('');
    const [hospital, setHospital] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri,
            name: filename,
            type,
        } as any);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                transformRequest: (data, headers) => formData, // Axios FormData hack
            });
            setImage(res.data.imageUrl || res.data.fileUrl);
        } catch (error: any) {
            Alert.alert("Upload Failed", "Could not upload image. " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = async () => {
        if (!name || !specialty || !experience || !hospital || !phone || !bio || !image) {
            Alert.alert("Error", "Please fill all fields and upload an image.");
            return;
        }

        try {
            setLoading(true);
            await api.post('/doctors/add', {
                name,
                specialty,
                experience,
                hospital,
                phone,
                bio,
                image
            });
            Alert.alert("Success", "Doctor added successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to add doctor.");
        } finally {
            setLoading(false);
        }
    };

    const displayImage = buildImageUri(image);

    return (
        <ScrollView className="flex-1 bg-[#F5F7FA]">
            <View className="flex-row items-center px-5 py-4 pt-12 bg-white shadow-sm">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#37474F" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[#37474F] ml-4">Add New Doctor</Text>
            </View>

            <View className="p-5 pb-20">
                {/* Image Upload */}
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <Image
                            source={{ uri: displayImage || 'https://via.placeholder.com/150' }}
                            className="w-[120px] h-[120px] rounded-full bg-[#eee]"
                        />
                        <View className="absolute bottom-0 right-0 bg-[#2E7D32] p-2 rounded-full border-[3px] border-white">
                            <FontAwesome5 name="camera" size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {uploading && <ActivityIndicator color="#2E7D32" className="mt-2" />}
                </View>

                {/* Form */}
                <View className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                    <View>
                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Full Name</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={name} onChangeText={setName} placeholder="Dr. Name" />
                    </View>

                    <View>
                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Specialty</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={specialty} onChangeText={setSpecialty} placeholder="e.g. General Physician, Skin Specialist" />
                    </View>

                    <View className="flex-row justify-between">
                        <View className="w-[48%]">
                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Experience</Text>
                            <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={experience} onChangeText={setExperience} placeholder="e.g. 10 years" />
                        </View>
                        <View className="w-[48%]">
                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Phone</Text>
                            <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Hospital / Clinic</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={hospital} onChangeText={setHospital} />
                    </View>

                    <View>
                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Bio / Description</Text>
                        <TextInput
                            className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base h-[100px]"
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            textAlignVertical="top"
                            placeholder="About the doctor..."
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    className="bg-[#2E7D32] py-4 rounded-xl mt-6 shadow-md shadow-[#2E7D32]/30 flex-row justify-center items-center"
                    onPress={handleAdd}
                    disabled={loading || uploading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesome5 name="save" size={18} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-2">Add Doctor</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default AdminAddDoctorScreen;
