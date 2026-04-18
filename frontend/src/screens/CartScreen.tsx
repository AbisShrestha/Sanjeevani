import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    SafeAreaView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { buildImageUri } from '../utils/image';

const CartScreen = ({ navigation }: { navigation: any }) => {
    // const navigation = useNavigation<any>();
    const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

    React.useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const confirmDelete = (id: number) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this medicine from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeFromCart(id),
                },
            ]
        );
    };

    const handleCheckout = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                Alert.alert(
                    'Login Required',
                    'You need to be logged in to checkout. Would you like to login now?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Login',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
                return;
            }
            
            // Navigate to the new Checkout Screen
            navigation.navigate('Checkout');
            
        } catch (error) {
            console.error(error);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const imageUri = buildImageUri(item.imageurl, 'https://via.placeholder.com/100?text=No+Image');
        return (
        <View className="flex-row bg-white rounded-2xl p-4 mb-3 items-center shadow-sm">
            <Image
                source={{
                    uri: imageUri || 'https://via.placeholder.com/100?text=No+Image',
                }}
                className="w-[70px] h-[70px] rounded-xl bg-[#f0f0f0]"
            />
            <View className="flex-1 ml-4 justify-center">
                <Text className="text-base font-bold text-[#333] mb-1 leading-5" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text className="text-sm font-bold text-[#00695C]">Rs. {item.price}</Text>
            </View>

            {/* Quantity Controls */}
            <View className="flex-row items-center bg-[#F5F7FA] rounded-lg px-2 py-1 mr-4">
                <TouchableOpacity
                    onPress={() => updateQuantity(item.medicineid, -1)}
                    className="w-8 h-8 justify-center items-center bg-white rounded-md shadow-sm"
                >
                    <Text className="text-lg font-bold text-[#555]">-</Text>
                </TouchableOpacity>
                <Text className="mx-3 text-base font-bold text-[#333]">{item.quantity}</Text>
                <TouchableOpacity
                    onPress={() => updateQuantity(item.medicineid, 1)}
                    className="w-8 h-8 justify-center items-center bg-white rounded-md shadow-sm"
                >
                    <Text className="text-lg font-bold text-[#555]">+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                className="p-2"
                onPress={() => confirmDelete(item.medicineid)}
            >
                <FontAwesome5 name="trash" size={16} color="#CFD8DC" />
            </TouchableOpacity>
        </View>
    );
    };

    return (
        <View className="flex-1 bg-[#F5F7FA] pt-5">
            <StatusBar style="dark" />

            {/* Header */}
            <View className={`px-5 pb-5 flex-row items-center ${Platform.OS === 'ios' ? 'pt-8' : ''}`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#37474F" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333] ml-4">Your Cart</Text>
            </View>

            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item: any) => (item.medicineid || Math.random()).toString()}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20 px-10">
                        <View className="w-24 h-24 bg-[#E0F2F1] rounded-full items-center justify-center mb-6 shadow-sm">
                            <FontAwesome5 name="shopping-basket" size={40} color="#00695C" />
                        </View>
                        <Text className="text-xl font-bold text-[#37474F] mb-2 text-center">Your cart is empty</Text>
                        <Text className="text-[#78909C] text-center leading-5 mb-8">
                            Looks like you haven't added any medicines to your cart yet. Start exploring our store to find what you need!
                        </Text>
                        <TouchableOpacity
                            className="bg-[#00695C] px-8 py-4 rounded-2xl shadow-md active:opacity-90 w-full"
                            onPress={() => navigation.navigate('User', { screen: 'Store' })}
                        >
                            <Text className="text-white font-bold text-center text-base">Browse Medicines</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
            
            {cartItems.length > 0 && (
                <View className="absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-[24px] shadow-2xl pb-8">
                    <View className="flex-row justify-between mb-6">
                        <Text className="text-lg font-semibold text-[#546E7A]">Total Amount:</Text>
                        <Text className="text-2xl font-bold text-[#00695C]">Rs. {totalPrice.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-[#00695C] py-4 rounded-xl items-center shadow-lg active:bg-[#004D40]"
                        onPress={handleCheckout}
                    >
                        <Text className="text-white text-lg font-bold tracking-wide">Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default CartScreen;
