import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api, { SERVER_URL, setAuthToken } from '../services/api';
import { useCart } from '../context/CartContext';
import { useFocusEffect } from '@react-navigation/native';

const UserProfileScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { refreshCartAuth } = useCart();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // BMI State
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<{ value: number; label: string; color: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/profile');
      setProfile(res.data);
      setEditName(res.data.fullname);
      setEditPhone(res.data.phone || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploading(true);

    try {
      const formData = new FormData();
      const filename = asset.fileName || asset.uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // @ts-ignore
      formData.append('file', { uri: asset.uri, name: filename, type });

      const res = await api.post('/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data: any, headers: any) => formData,
      });

      setProfile((prev: any) => ({ ...prev, profileimage: res.data.profileimage }));

      // Update AsyncStorage user data too
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.profileimage = res.data.profileimage;
        await AsyncStorage.setItem('user', JSON.stringify(parsed));
      }

      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.fullname || 'User') + '&size=200&background=00695C&color=fff&bold=true&format=png';

  const getProfileImageUri = () => {
    if (!profile?.profileimage) return DEFAULT_AVATAR;
    if (profile.profileimage.startsWith('http')) return profile.profileimage;
    return `${SERVER_URL}${profile.profileimage}`;
  };

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      Alert.alert('Error', 'Please enter valid height and weight.');
      return;
    }

    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters * heightInMeters);
    const rounded = Math.round(bmi * 10) / 10;

    let label = '';
    let color = '';
    if (bmi < 18.5) { label = 'Underweight'; color = '#1E88E5'; }
    else if (bmi < 25) { label = 'Normal'; color = '#43A047'; }
    else if (bmi < 30) { label = 'Overweight'; color = '#FFA000'; }
    else { label = 'Obese'; color = '#D32F2F'; }

    setBmiResult({ value: rounded, label, color });
  };

  const handleSaveProfile = async () => {
    try {
      if (!editName.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      setLoading(true);
      const res = await api.put('/profile', { fullName: editName, phone: editPhone });
      setProfile(res.data.user);
      
      // Update local storage
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.fullName = res.data.user.fullname;
        parsed.phone = res.data.user.phone;
        await AsyncStorage.setItem('user', JSON.stringify(parsed));
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Save profile failed:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['user', 'token']);
          setAuthToken(null);
          await refreshCartAuth();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7FA]">
        <ActivityIndicator size="large" color="#00695C" />
      </View>
    );
  }

  const profileImageUri = getProfileImageUri();

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        className="bg-[#00695C] pb-8 px-6 rounded-b-[30px] shadow-md items-center"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <View className="flex-row w-full items-center mb-5">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-[22px] font-extrabold text-white ml-4">My Profile</Text>
          <TouchableOpacity 
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)} 
            className="ml-auto bg-white/20 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-bold">{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <TouchableOpacity onPress={pickAndUploadImage} activeOpacity={0.8} className="items-center">
          <View className="relative">
            <Image
              source={{ uri: profileImageUri || DEFAULT_AVATAR }}
              className="w-[100px] h-[100px] rounded-full border-[3px] border-white"
            />
            {uploading ? (
              <View className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border-2 border-[#00695C]">
                <ActivityIndicator size="small" color="#00695C" />
              </View>
            ) : (
              <View className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border-2 border-[#00695C]">
                <FontAwesome5 name="camera" size={12} color="#00695C" />
              </View>
            )}
          </View>
          <Text className="text-white text-[18px] font-bold mt-3">{profile?.fullname || 'User'}</Text>
          <Text className="text-[#B2DFDB] text-[13px]">{profile?.email || ''}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {/* Quick Links */}
          <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            <TouchableOpacity
              className="bg-white p-4 rounded-[16px] items-center w-[48%] mb-3 shadow-sm border border-[#F0F0F0]"
              onPress={() => navigation.navigate('MyMedicines')}
              activeOpacity={0.8}
            >
              <View className="w-[44px] h-[44px] rounded-full bg-[#F3E5F5] justify-center items-center mb-2">
                <FontAwesome5 name="prescription-bottle-alt" size={20} color="#7B1FA2" />
              </View>
              <Text className="text-[13px] font-semibold text-[#37474F]">My Medicines</Text>
              <Text className="text-[11px] text-[#90A4AE] mt-0.5">Refill Tracker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white p-4 rounded-[16px] items-center w-[48%] mb-3 shadow-sm border border-[#F0F0F0]"
              onPress={() => navigation.navigate('UserAppointments')}
              activeOpacity={0.8}
            >
              <View className="w-[44px] h-[44px] rounded-full bg-[#E3F2FD] justify-center items-center mb-2">
                <FontAwesome5 name="calendar-check" size={20} color="#1565C0" />
              </View>
              <Text className="text-[13px] font-semibold text-[#37474F]">Appointments</Text>
              <Text className="text-[11px] text-[#90A4AE] mt-0.5">Video Consults</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white p-4 rounded-[16px] items-center w-[48%] mb-3 shadow-sm border border-[#F0F0F0]"
              onPress={() => navigation.navigate('MyOrders')}
              activeOpacity={0.8}
            >
              <View className="w-[44px] h-[44px] rounded-full bg-[#E0F2F1] justify-center items-center mb-2">
                <FontAwesome5 name="shopping-bag" size={20} color="#00897B" />
              </View>
              <Text className="text-[13px] font-semibold text-[#37474F]">My Orders</Text>
              <Text className="text-[11px] text-[#90A4AE] mt-0.5">Track Purchases</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white p-4 rounded-[16px] items-center w-[48%] mb-3 shadow-sm border border-[#F0F0F0]"
              onPress={() => navigation.navigate('MyMedicalReports')}
              activeOpacity={0.8}
            >
              <View className="w-[44px] h-[44px] rounded-full bg-[#FFF3E0] justify-center items-center mb-2">
                <FontAwesome5 name="file-medical-alt" size={20} color="#E65100" />
              </View>
              <Text className="text-[13px] font-semibold text-[#37474F]">Medical Reports</Text>
              <Text className="text-[11px] text-[#90A4AE] mt-0.5">Upload & Manage</Text>
            </TouchableOpacity>
          </View>

          {/* BMI Calculator */}
          <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">BMI Calculator</Text>
          <View className="bg-white rounded-[16px] p-5 mb-6 shadow-sm border border-[#F0F0F0]">
            <View className="flex-row items-center mb-4">
              <View className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] justify-center items-center mr-3">
                <FontAwesome5 name="weight" size={18} color="#00695C" />
              </View>
              <View>
                <Text className="text-[15px] font-bold text-[#37474F]">Check Your BMI</Text>
                <Text className="text-[12px] text-[#90A4AE]">Body Mass Index Calculator</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="w-[48%]">
                <Text className="text-[12px] font-bold text-[#666] uppercase mb-1.5 ml-1">Height (cm)</Text>
                <TextInput
                  className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base border border-[#E0E0E0]"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="e.g. 170"
                  placeholderTextColor="#B0BEC5"
                />
              </View>
              <View className="w-[48%]">
                <Text className="text-[12px] font-bold text-[#666] uppercase mb-1.5 ml-1">Weight (kg)</Text>
                <TextInput
                  className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base border border-[#E0E0E0]"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="e.g. 65"
                  placeholderTextColor="#B0BEC5"
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-[#00695C] py-3 rounded-xl items-center mt-1"
              onPress={calculateBMI}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-[14px]">Calculate BMI</Text>
            </TouchableOpacity>

            {/* BMI Result */}
            {bmiResult && (
              <View className="mt-4">
                {/* Your Result */}
                <View className="bg-[#F5F7FA] rounded-xl p-4 items-center border border-[#E0E0E0]">
                  <Text className="text-[36px] font-extrabold" style={{ color: bmiResult.color }}>
                    {bmiResult.value}
                  </Text>
                  <View className="px-3 py-1 rounded-lg mt-1" style={{ backgroundColor: bmiResult.color + '20' }}>
                    <Text className="text-[14px] font-bold" style={{ color: bmiResult.color }}>
                      {bmiResult.label}
                    </Text>
                  </View>
                  <Text className="text-[12px] text-[#90A4AE] mt-2 text-center">
                    {bmiResult.value < 18.5
                      ? 'You are underweight. Consider consulting a nutritionist.'
                      : bmiResult.value < 25
                      ? 'Great! Your weight is in the healthy range.'
                      : bmiResult.value < 30
                      ? 'You are overweight. Regular exercise is recommended.'
                      : 'Obese range. Please consult a doctor for guidance.'}
                  </Text>
                </View>

                {/* BMI Reference Chart */}
                <View className="mt-4 bg-white rounded-xl p-4 border border-[#E0E0E0]">
                  <Text className="text-[13px] font-bold text-[#546E7A] uppercase mb-3 text-center tracking-wider">BMI Reference Ranges</Text>
                  
                  {[
                    { range: '< 18.5', label: 'Underweight', color: '#1E88E5', key: 'Underweight' },
                    { range: '18.5 – 24.9', label: 'Normal', color: '#43A047', key: 'Normal' },
                    { range: '25.0 – 29.9', label: 'Overweight', color: '#FFA000', key: 'Overweight' },
                    { range: '≥ 30.0', label: 'Obese', color: '#D32F2F', key: 'Obese' },
                  ].map((item) => {
                    const isActive = bmiResult.label === item.key;
                    return (
                      <View
                        key={item.key}
                        className={`flex-row items-center py-2.5 px-3 rounded-lg mb-1.5 ${isActive ? '' : ''}`}
                        style={{
                          backgroundColor: isActive ? item.color + '15' : 'transparent',
                          borderLeftWidth: isActive ? 4 : 0,
                          borderLeftColor: item.color,
                        }}
                      >
                        <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                        <Text className={`flex-1 text-[14px] ${isActive ? 'font-bold' : 'font-medium'} text-[#37474F]`}>
                          {item.label}
                        </Text>
                        <Text className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'} text-[#78909C]`}>
                          {item.range}
                        </Text>
                        {isActive && (
                          <Text className="ml-2 text-[11px]">👈</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Account Info */}
          <Text className="text-lg font-bold text-[#263238] mb-4 ml-1">Account</Text>
          <View className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-[#F0F0F0] mb-6">
            <View className="flex-row items-center p-4 border-b border-[#F5F5F5]">
              <FontAwesome5 name="user" size={16} color="#00695C" />
              {isEditing ? (
                <TextInput
                  className="flex-1 ml-3 text-[15px] text-[#37474F] p-0"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                />
              ) : (
                <Text className="text-[15px] text-[#37474F] ml-3 font-medium flex-1">{profile?.fullname || 'N/A'}</Text>
              )}
            </View>
            <View className="flex-row items-center p-4 border-b border-[#F5F5F5]">
              <FontAwesome5 name="envelope" size={16} color="#BDBDBD" />
              <Text className="text-[15px] text-[#9E9E9E] ml-3 font-medium flex-1">{profile?.email || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center p-4 border-b border-[#F5F5F5]">
              <FontAwesome5 name="phone" size={16} color="#00695C" />
              {isEditing ? (
                <TextInput
                  className="flex-1 ml-3 text-[15px] text-[#37474F] p-0"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Phone Number"
                  keyboardType="numeric"
                />
              ) : (
                <Text className="text-[15px] text-[#37474F] ml-3 font-medium flex-1">{profile?.phone || 'Not set'}</Text>
              )}
            </View>
            <View className="flex-row items-center p-4">
              <FontAwesome5 name="calendar" size={16} color="#00695C" />
              <Text className="text-[15px] text-[#37474F] ml-3 font-medium flex-1">
                Joined {(profile?.createdAt || profile?.createdat) ? new Date(profile.createdAt || profile.createdat).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              className="bg-gray-200 py-4 rounded-[16px] items-center mb-4"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-gray-700 font-bold">Cancel Editing</Text>
            </TouchableOpacity>
          )}

          {/* Logout */}
          <TouchableOpacity
            className="bg-[#FFEBEE] py-4 rounded-[16px] items-center flex-row justify-center border border-[#FFCDD2]"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="sign-out-alt" size={18} color="#D32F2F" />
            <Text className="text-[#D32F2F] font-bold text-[16px] ml-3">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default UserProfileScreen;
