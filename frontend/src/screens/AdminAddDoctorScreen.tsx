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
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { buildImageUri } from '../utils/image';
import { uploadImage as uploadFile } from '../services/fileUploadService';

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
            handleImageUpload(result.assets[0]);
        }
    };

    const handleImageUpload = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploading(true);
        try {
            const uploadedUrl = await uploadFile(asset, 'doctors');
            if (uploadedUrl) {
                setImage(uploadedUrl);
            } else {
                Alert.alert("Upload Failed", "Could not upload image.");
            }
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
        <View className="flex-1 bg-[#F5F7FA]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                >
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

                    <View className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Full Name</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" placeholder="Dr. John Doe" value={name} onChangeText={setName} />

                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Specialty</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" placeholder="Ayurvedic Physician" value={specialty} onChangeText={setSpecialty} />

                        <View className="flex-row justify-between mb-3">
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-[#666] uppercase mb-1">Experience</Text>
                                <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" placeholder="5 years" value={experience} onChangeText={setExperience} />
                            </View>
                            <View className="w-[48%]">
                                <Text className="text-xs font-bold text-[#666] uppercase mb-1">Phone</Text>
                                <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base" placeholder="98XXXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                            </View>
                        </View>

                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Hospital / Clinic</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base mb-3" placeholder="Sanjeevani Clinic" value={hospital} onChangeText={setHospital} />

                        <Text className="text-xs font-bold text-[#666] uppercase mb-1">Bio</Text>
                        <TextInput className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base h-[100px]" placeholder="Brief bio about the doctor..." value={bio} onChangeText={setBio} multiline textAlignVertical="top" />
                    </View>

                    <TouchableOpacity
                        className="bg-[#2E7D32] py-4 rounded-xl mt-6 shadow-md flex-row justify-center items-center"
                        onPress={handleAdd}
                        disabled={loading || uploading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <FontAwesome5 name="plus" size={18} color="#fff" />
                                <Text className="text-white font-bold text-lg ml-2">Add Doctor</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default AdminAddDoctorScreen;
