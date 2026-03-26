import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { buildImageUri } from '../utils/image';

const MedicineDetailsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    // Check route params
    if (!route || !route.params || !route.params.medicine) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Error: Medicine data not found.</Text>
            </View>
        );
    }

    const { medicine } = route.params;
    const { addToCart: addToCartContext } = useCart();
    const [adding, setAdding] = useState(false);

    const imageUrl = buildImageUri(medicine.imageurl, 'https://via.placeholder.com/300?text=No+Image');

    const addToCart = async () => {
        setAdding(true);
        try {
            await addToCartContext(medicine);
            Alert.alert('Success', 'Added to cart!');
        } catch (error) {
            console.error('Error adding to cart', error);
            Alert.alert('Error', 'Could not add to cart');
        } finally {
            setAdding(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Custom Back Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    left: 20,
                    zIndex: 10,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: 10,
                    borderRadius: 50,
                    top: Platform.OS === 'ios' ? 48 : 40,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 3,
                }}
                onPress={() => navigation.goBack()}
            >
                <FontAwesome5 name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Image
                    source={{ uri: imageUrl }}
                    style={{
                        width: '100%',
                        height: 350,
                        backgroundColor: '#eee',
                    }}
                    resizeMode="contain"
                />

                <View style={{
                    backgroundColor: '#fff',
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    marginTop: -24,
                    paddingTop: 32,
                    paddingHorizontal: 24,
                    paddingBottom: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 10,
                    minHeight: 500,
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#263238', lineHeight: 32 }}>{medicine.name}</Text>
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#00695C' }}>₹ {medicine.price}</Text>
                    </View>

                    {/* Category Chip */}
                    <View style={{ backgroundColor: '#E0F2F1', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 24 }}>
                        <Text style={{ color: '#00695C', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {medicine.categoryname || 'Ayurvedic Medicine'}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 8 }}>Description</Text>
                        <Text style={{ fontSize: 15, color: '#546E7A', lineHeight: 24 }}>
                            {medicine.description || 'No description available for this medicine.'}
                        </Text>
                    </View>

                    {medicine.benefits && (
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 8 }}>Benefits</Text>
                            <View style={{ backgroundColor: '#F5F7FA', padding: 16, borderRadius: 12 }}>
                                <Text style={{ fontSize: 15, color: '#546E7A', lineHeight: 24 }}>{medicine.benefits}</Text>
                            </View>
                        </View>
                    )}

                    {medicine.dosage && (
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 8 }}>Dosage</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <FontAwesome5 name="clock" size={16} color="#00695C" style={{ marginTop: 3, marginRight: 8 }} />
                                <Text style={{ fontSize: 15, color: '#546E7A', lineHeight: 24, flex: 1 }}>{medicine.dosage}</Text>
                            </View>
                        </View>
                    )}

                    {medicine.precautions && (
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 8 }}>Precautions</Text>
                            <View style={{ backgroundColor: '#FFEBEE', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FFCDD2' }}>
                                <Text style={{ fontSize: 15, color: '#D32F2F', lineHeight: 24 }}>{medicine.precautions}</Text>
                            </View>
                        </View>
                    )}

                    {medicine.usageinstructions && (
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#37474F', marginBottom: 8 }}>Usage Instructions</Text>
                            <View style={{ backgroundColor: '#E3F2FD', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BBDEFB' }}>
                                <Text style={{ fontSize: 15, color: '#0D47A1', lineHeight: 24 }}>{medicine.usageinstructions}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: '#7B1FA2', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => navigation.navigate('AddMedicineTracker', { medicine })}
                        activeOpacity={0.8}
                    >
                        <FontAwesome5 name="bell" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 8 }}>Track</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flex: 2, backgroundColor: '#00695C', paddingVertical: 16, borderRadius: 16, alignItems: 'center', opacity: adding ? 0.8 : 1 }}
                        onPress={addToCart}
                        disabled={adding}
                    >
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }}>
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default MedicineDetailsScreen;
