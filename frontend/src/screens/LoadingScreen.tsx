import React, { useEffect } from 'react';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = ({ navigation }: { navigation: any }) => {
    // const navigation = useNavigation<any>();

    useEffect(() => {
        const checkLogin = async () => {
            // Minimum delay to show logo
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                // 1. Check Onboarding
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    navigation.replace('Onboarding');
                    return;
                }

                // 2. Check User
                const userData = await AsyncStorage.getItem('user');
                if (!userData) {
                    navigation.replace('Login');
                    return;
                }

                const user = JSON.parse(userData);
                let target = 'User';
                if (user.role === 'admin') target = 'Admin';
                else if (user.role === 'doctor') target = 'Doctor';

                navigation.replace(target);

            } catch (e) {
                console.error("Auth Check Failed:", e);
                navigation.replace('Login');
            }
        };

        checkLogin();
    }, []);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Image
                source={require('../assets/logo.jpeg')}
                className="w-[150px] h-[150px] mb-5 rounded-[30px]"
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-[#00695C] tracking-widest">Sanjeevani</Text>
            <ActivityIndicator size="large" color="#00695C" style={{ marginTop: 50 }} />
        </View>
    );
};

export default LoadingScreen;
