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
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import { buildImageUri } from '../utils/image';
import * as ImagePicker from 'expo-image-picker';

const AdminEditDoctorScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    // Using props instead of hooks
    const { doctor } = route.params;

    const [name, setName] = useState(doctor.name);
    const [specialty, setSpecialty] = useState(doctor.specialty);
    const [experience, setExperience] = useState(doctor.experience);
    const [hospital, setHospital] = useState(doctor.hospital);
    const [phone, setPhone] = useState(doctor.phone);
    const [bio, setBio] = useState(doctor.bio);
    const [image, setImage] = useState(doctor.image || doctor.imageurl);
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
            type
        } as any);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                transformRequest: (data, headers) => formData,
            });
            setImage(res.data.imageUrl || res.data.fileUrl);
        } catch (error: any) {
            Alert.alert("Upload Failed", "Could not upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!name || !specialty) {
            Alert.alert("Error", "Name and Specialty are required.");
            return;
        }

        try {
            setLoading(true);
            await api.put(`/doctors/${doctor.id}`, {
                name,
                specialty,
                experience,
                hospital,
                phone,
                bio,
                image
            });
            Alert.alert("Success", "Doctor updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update doctor.");
        } finally {
            setLoading(false);
        }
    };

  const displayImage = buildImageUri(image);

    return (
        <ScrollView className="flex-1 bg-[#F5F7FA]">
            <View className="p-5">
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

                {/* Form Logic Same as Add Screen - Simplified for Brevity in this batch replace */}
                <View className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                    <Text className="text-xs font-bold text-[#666] uppercase mb-1">Full Name</Text>
                    <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" value={name} onChangeText={setName} />

                    <Text className="text-xs font-bold text-[#666] uppercase mb-1">Specialty</Text>
                    <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" value={specialty} onChangeText={setSpecialty} />

                    <View className="flex-row justify-between mb-3">
                        <View className="w-[48%]">
                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Experience</Text>
                            <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={experience} onChangeText={setExperience} />
                        </View>
                        <View className="w-[48%]">
                            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Phone</Text>
                            <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        </View>
                    </View>

                    <Text className="text-xs font-bold text-[#666] uppercase mb-1">Hospital / Clinic</Text>
                    <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" value={hospital} onChangeText={setHospital} />

                    <Text className="text-xs font-bold text-[#666] uppercase mb-1">Bio</Text>
                    <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base h-[100px]" value={bio} onChangeText={setBio} multiline textAlignVertical="top" />
                </View>

                <TouchableOpacity
                    className="bg-[#2E7D32] py-4 rounded-xl mt-6 shadow-mb flex-row justify-center items-center"
                    onPress={handleUpdate}
                    disabled={loading || uploading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <FontAwesome5 name="save" size={18} color="#fff" />
                            <Text className="text-white font-bold text-lg ml-2">Update Doctor</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default AdminEditDoctorScreen;
