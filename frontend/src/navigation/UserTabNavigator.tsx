import React from 'react';
import { View, Text, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Screens
import UserHomeScreen from '../screens/UserHomeScreen';
import SanjeevaniStoreScreen from '../screens/StoreScreen';
import FindDoctorScreen from '../screens/FindDoctorScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ChatBotScreen from '../screens/ChatBotScreen';

// Context for Badge
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const UserTabNavigator = ({ navigation }: { navigation: any }) => {
    const { cartCount } = useCart();
    const [isGuest, setIsGuest] = React.useState(true);

    React.useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            setIsGuest(!token);
        };
        const unsubscribe = navigation.addListener('focus', checkAuth);
        checkAuth();
        return unsubscribe;
    }, [navigation]);

    const handleChatPress = (e: any) => {
        if (isGuest) {
            e.preventDefault(); // Synchronous block
            Alert.alert(
                'Login Required',
                'Please login to use the AI Health Assistant.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]
            );
        }
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#00695C',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    backgroundColor: '#fff',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={UserHomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 name="home" color={color} size={20} />
                    ),
                }}
            />
            <Tab.Screen
                name="Store"
                component={SanjeevaniStoreScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <View>
                            <FontAwesome5 name="shopping-bag" color={color} size={20} />
                            {cartCount > 0 && (
                                <View className="absolute -top-2 -right-2.5 bg-[#FF5252] rounded-full w-[18px] h-[18px] justify-center items-center border border-white">
                                    <Text className="text-white text-[10px] font-bold">{cartCount}</Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />

            {/* Central AI Chat Button - Highlighted */}
            <Tab.Screen
                name="AI Chat"
                component={ChatBotScreen}
                listeners={{
                    tabPress: handleChatPress,
                }}
                options={{
                    tabBarIcon: () => (
                        <View className="w-[50px] h-[50px] rounded-full bg-[#00695C] justify-center items-center mb-5 shadow-lg">
                            <FontAwesome5 name="robot" color="#fff" size={24} />
                        </View>
                    ),
                    tabBarLabel: () => null, // Hide label for center button
                }}
            />

            <Tab.Screen
                name="Consult"
                component={FindDoctorScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 name="user-md" color={color} size={20} />
                    ),
                }}
            />
            <Tab.Screen
                name="Insights"
                component={CommunityScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 name="book-open" color={color} size={20} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default UserTabNavigator;
