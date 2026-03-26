import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

import { loginUser } from '../services/authService';
import { setAuthToken, BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  // Using props instead of useNavigation hook to avoid context timing issues

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { refreshCartAuth } = useCart();

  /* 
     LOGIN HANDLER
   */

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(email, password);

      // Save auth data
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));

      //  IMPORTANT: sync Axios token immediately
      setAuthToken(response.token);
      
      // Refresh Cart to drop Guest Cart and load User Cart
      await refreshCartAuth();

      // Navigate based on role
      const role = response.user.role;
      const target =
        role === 'admin'
          ? 'Admin'
          : role === 'doctor'
            ? 'Doctor'
            : 'User';

      navigation.reset({
        index: 0,
        routes: [{ name: target }],
      });
    } catch (error: any) {
      console.error(error);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error.response) {
        // Server responded with an error code
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server Error (${error.response.status})`;
        }
      } else if (error.request) {
        // Network error (no response)
        errorMessage = 'Network error. Please check your internet connection and ensure the server is running.';
      } else {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'User' }],
    });
  };

  /*
     UI
   */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#eef7f3]"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#eef7f3" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>

        {/* LOGO */}
        <View className="w-[120px] h-[120px] rounded-[30px] overflow-hidden self-center mb-4 bg-[#cfe6dc] shadow-sm">
          <Image
            source={require('../assets/logo.jpeg')}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        <Text className="text-[28px] font-extrabold text-[#2e7d32] text-center">Sanjeevani</Text>
        <Text className="text-center text-[#5f7f67] mb-8 mt-1">Ayurvedic Health & Lifestyle</Text>

        {/* EMAIL */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-4 shadow-sm">
          <FontAwesome5 name="envelope" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* PASSWORD */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[54px] border border-[#dfe6e0] mb-4 shadow-sm">
          <FontAwesome5 name="lock" size={18} color="#5f7f67" />
          <TextInput
            className="flex-1 pl-3 text-[15px] text-black h-full"
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          className="bg-[#2e7d32] py-4 rounded-2xl mt-4 shadow-md active:bg-[#1b5e20]"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-bold text-center">
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* REGISTER */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Register')}
          className="mt-6"
        >
          <Text className="text-center text-[#555]">
            Don’t have an account?{' '}
            <Text className="text-[#2e7d32] font-bold">Create Account</Text>
          </Text>
        </TouchableOpacity>

        {/* GUEST ACCESS */}
        <TouchableOpacity
          className="mt-6 self-center p-2"
          onPress={handleGuestLogin}
          activeOpacity={0.7}
        >
          <View className="border-b border-[#00695C] pb-1">
            <Text className="text-[#00695C] text-base font-semibold">Skip & Explore as Guest</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
