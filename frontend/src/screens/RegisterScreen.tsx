import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { registerUser } from '../services/authService';

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        fullName,
        email,
        phone,
        password,
      });

      Alert.alert('Success', 'Account created successfully');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#eef7f3]"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eef7f3" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>

        {/* LOGO */}
        <View className="w-[110px] h-[110px] rounded-[28px] overflow-hidden self-center mb-5 bg-[#cfe6dc] shadow-sm">
          <Image
            source={require('../assets/logo.jpeg')}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        <Text className="text-[26px] font-extrabold text-[#2e7d32] text-center">Create Account</Text>
        <Text className="text-center text-[#5f7f67] mb-8 mt-1">Start your natural healing journey</Text>

        {/* FULL NAME */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-3.5 shadow-sm">
          <FontAwesome5 name="user" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* EMAIL */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-3.5 shadow-sm">
          <FontAwesome5 name="envelope" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Email Address"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* PHONE */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-3.5 shadow-sm">
          <FontAwesome5 name="phone" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* PASSWORD */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-3.5 shadow-sm">
          <FontAwesome5 name="lock" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Create a strong password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
            <FontAwesome5
              name={showPassword ? 'eye-slash' : 'eye'}
              size={18}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {/* REGISTER BUTTON */}
        <TouchableOpacity
          className="bg-[#2e7d32] py-4 rounded-2xl mt-4 shadow-md active:bg-[#1b5e20]"
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold text-center">
            {loading ? 'Creating...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-6">
          <Text className="text-center text-[#555]">
            Already have an account?{' '}
            <Text className="text-[#2e7d32] font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
