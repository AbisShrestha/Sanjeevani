import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    ActivityIndicator,
    StatusBar,
    Platform,
    RefreshControl,
    Alert,
    ScrollView,
    StyleSheet, // Using StyleSheet for raw styling
    Pressable, // Using Pressable instead of TouchableOpacity for direct control
} from 'react-native';

import { FontAwesome5 } from '@expo/vector-icons';
import { getAllMedicines } from '../services/medicineService';
import { useCart } from '../context/CartContext';
import { SERVER_URL } from '../services/api';

// --- CONSTANTS ---
const CATEGORIES = [
    { id: 'All', name: 'All', icon: 'th-large' },
    { id: 'Herbs', name: 'Herbs', icon: 'leaf' },
    { id: 'Capsule', name: 'Capsule', icon: 'capsules' },
    { id: 'Tablet', name: 'Tablet', icon: 'tablets' },
    { id: 'Oil', name: 'Oil', icon: 'flask' },
    { id: 'Syrup', name: 'Syrup', icon: 'wine-bottle' },
    { id: 'Powder', name: 'Powder', icon: 'mortar-pestle' },
];

const getCategoryIcon = (name: string) => {
    if (!name) return 'tag';
    const lower = String(name).toLowerCase();
    if (lower.includes('herb')) return 'leaf';
    if (lower.includes('oil')) return 'flask';
    if (lower.includes('tablet') || lower.includes('pill')) return 'pills';
    if (lower.includes('immun')) return 'shield-virus';
    if (lower.includes('digest')) return 'fire';
    if (lower.includes('skin')) return 'spa';
    if (lower.includes('women')) return 'venus';
    if (lower.includes('baby') || lower.includes('child')) return 'baby';
    return 'tag';
};

// --- STANDALONE ITEM COMPONENT (Prevents recreation on render) ---
const MedicineItem = React.memo(({ item, viewMode, onNavigate, onAddToCart }: any) => {
    if (!item || !item.name) return null;

    // Use a clean local variable for image URL
    const imageUrl = useMemo(() => {
        if (!item.imageurl) return 'https://via.placeholder.com/150?text=Sanjeevani';
        if (item.imageurl.startsWith('http')) return item.imageurl;

        let path = item.imageurl.replace(/\\/g, '/');
        if (path.includes('uploads/')) path = path.substring(path.indexOf('uploads/'));
        else if (!path.startsWith('uploads/')) path = `uploads/${path}`;
        if (path.startsWith('/')) path = path.substring(1);

        return `${SERVER_URL}/${path}`;
    }, [item.imageurl]);

    // Using RAW STYLES for MedicineItem too, just in case NativeWind is cursed
    const containerStyle = viewMode === 'grid'
        ? styles.gridItemContainer
        : styles.listItemContainer;

    if (viewMode === 'grid') {
        return (
            <Pressable
                style={styles.gridItemContainer}
                onPress={() => onNavigate(item)}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.gridImage}
                    resizeMode="cover"
                />
                <View>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemCategory}>Ayurvedic</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                    </View>
                    <Pressable
                        style={styles.addButton}
                        onPress={() => onAddToCart(item)}
                    >
                        <Text style={styles.addButtonText}>ADD +</Text>
                    </Pressable>
                </View>
            </Pressable>
        );
    }

    // LIST VIEW
    return (
        <Pressable
            style={styles.listItemContainer}
            onPress={() => onNavigate(item)}
        >
            <Image
                source={{ uri: imageUrl }}
                style={styles.listImage}
                resizeMode="cover"
            />
            <View style={styles.listContent}>
                <View>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemCategory}>Ayurvedic Medicine</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description || item.benefits || 'No description available for this medicine.'}
                    </Text>
                </View>
                <View style={styles.listFooter}>
                    <Text style={styles.itemPrice}>Rs. {item.price}</Text>
                    <Pressable
                        style={styles.addToCartButton}
                        onPress={() => onAddToCart(item)}
                    >
                        <Text style={styles.addToCartText}>ADD TO CART</Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
});

const SanjeevaniStoreScreen = (props: any) => {
    // ALWAYS RENDER NAVIGATION CONTEXT
    const { navigation } = props;

    const { cartCount, addToCart } = useCart();

    // State
    const [medicines, setMedicines] = useState<any[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'none' | 'lowHigh' | 'highLow'>('none');

    // Fetch Data
    const fetchMedicines = useCallback(async () => {
        try {
            console.log("[StoreScreen] Fetching medicines...");
            const data = await getAllMedicines();
            const validData = Array.isArray(data)
                ? data.filter(item => item && typeof item === 'object' && item.medicineid)
                : [];
            setMedicines(validData);
        } catch (error) {
            console.error('[StoreScreen] Failed to fetch medicines', error);
            setMedicines([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    // Filtering Logic
    const filterAndSortMedicines = useCallback(() => {
        try {
            console.log(`[StoreScreen] Filtering. Category: ${selectedCategory}, Search: ${searchText}`);
            let result = medicines.filter(m => m && typeof m === 'object' && m.name && m.medicineid);

            // Search
            if (searchText) {
                const lower = searchText.toLowerCase();
                result = result.filter(
                    (m) =>
                        (m.name && m.name.toLowerCase().includes(lower)) ||
                        (m.description && m.description.toLowerCase().includes(lower))
                );
            }

            // Category
            if (selectedCategory !== 'All') {
                const selected = String(selectedCategory).toLowerCase();
                result = result.filter((m) => {
                    const catName = m.categoryname ? String(m.categoryname).toLowerCase() : '';
                    return catName === selected || catName.includes(selected);
                });
            }

            // Sort
            if (sortBy === 'lowHigh') {
                result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            } else if (sortBy === 'highLow') {
                result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            }

            console.log(`[StoreScreen] Filtered count: ${result.length}`);
            setFilteredMedicines(result);
        } catch (error) {
            console.error("[StoreScreen] Filter error:", error);
            setFilteredMedicines([]);
        }
    }, [medicines, searchText, selectedCategory, sortBy]);

    useEffect(() => {
        filterAndSortMedicines();
    }, [filterAndSortMedicines]);

    // Derived Categories
    const derivedCategories = useMemo(() => {
        try {
            const staticIds = new Set(CATEGORIES.map(c => c.id.toLowerCase()));
            const dbCategories = medicines
                .map(m => m.categoryname)
                .filter(Boolean)
                .map(String)
                .filter(name => !staticIds.has(name.toLowerCase()));

            const uniqueDbCategories = Array.from(new Set(dbCategories));
            const dynamicCats = uniqueDbCategories.map(name => ({
                id: name,
                name: name,
                icon: getCategoryIcon(name)
            }));
            return [...CATEGORIES, ...dynamicCats];
        } catch (error) {
            return CATEGORIES;
        }
    }, [medicines]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMedicines();
    }, [fetchMedicines]);

    const handleNavigate = useCallback((item: any) => {
        if (navigation && typeof navigation.navigate === 'function') {
            navigation.navigate('MedicineDetails', { medicine: item });
        } else {
            Alert.alert("Navigation Error", "Navigation prop missing.");
        }
    }, [navigation]);

    const handleAddToCart = useCallback((item: any) => {
        addToCart(item);
    }, [addToCart]);


    return (
        <View style={styles.screenContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#00695C" />

            {/* HEADER - USING NATIVEWIND HERE IS OKAY, IT'S STATIC */}
            <View className={`bg-[#00695C] pb-5 px-5 flex-row justify-between items-center shadow-lg ${Platform.OS === 'ios' ? 'pt-[50px]' : 'pt-5'}`}>
                <View className="flex-row items-center">
                    <Pressable onPress={() => navigation && navigation.navigate('Home')} className="mr-[15px]">
                        <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                    </Pressable>
                    <Text className="text-[22px] font-bold text-white">Sanjeevani Store</Text>
                </View>
                <Pressable onPress={() => navigation && navigation.navigate('Cart')} className="p-1.5">
                    <FontAwesome5 name="shopping-cart" size={22} color="#fff" />
                    {cartCount > 0 && (
                        <View className="absolute -top-2 -right-2 bg-[#EF5350] rounded-full w-[18px] h-[18px] justify-center items-center border-[1.5px] border-white">
                            <Text className="text-white text-[9px] font-bold">{cartCount}</Text>
                        </View>
                    )}
                </Pressable>
            </View>

            {/* SEARCH & FILTERS */}
            <View className="bg-white pb-2.5 border-b border-[#eee] shadow-sm z-10">
                <View className="flex-row items-center bg-[#F5F7FA] mx-[15px] mt-[15px] mb-2.5 px-[15px] rounded-xl h-[45px]">
                    <FontAwesome5 name="search" size={16} color="#999" />
                    <TextInput
                        className="flex-1 ml-2.5 text-base text-[#333]"
                        placeholder="Search medicines..."
                        value={searchText}
                        onChangeText={setSearchText}
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />
                </View>

                {/* HORIZONTAL CATEGORIES - FIX: USING RAW STYLES TO AVOID NATIVEWIND CRASH */}
                <View className="flex-row items-center pl-[15px]">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                        {derivedCategories.map((item) => {
                            const isActive = selectedCategory === item.id;
                            return (
                                <Pressable
                                    key={item.id}
                                    style={[
                                        styles.categoryButton,
                                        isActive ? styles.categoryButtonActive : styles.categoryButtonInactive
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(item.id);
                                    }}
                                >
                                    <FontAwesome5
                                        name={item.icon}
                                        size={14}
                                        color={isActive ? '#fff' : '#666'}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : styles.categoryTextInactive]}>
                                        {item.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* SORT & VIEW MODE */}
                    <View className="flex-row pr-[15px] pl-[5px] border-l border-[#eee]">
                        <Pressable
                            className="p-2 ml-[5px]"
                            onPress={() => {
                                const next = sortBy === 'none' ? 'lowHigh' : sortBy === 'lowHigh' ? 'highLow' : 'none';
                                setSortBy(next);
                            }}
                        >
                            <FontAwesome5 name={sortBy === 'none' ? 'sort' : sortBy === 'lowHigh' ? 'sort-amount-down-alt' : 'sort-amount-up'} size={18} color="#00695C" />
                        </Pressable>

                        <Pressable
                            className="p-2 ml-[5px]"
                            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        >
                            <FontAwesome5 name={viewMode === 'grid' ? 'list' : 'th-large'} size={18} color="#00695C" />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* PRODUCT LIST - RESTORED MEDICINE ITEM BUT WITH RAW STYLES */}
            <ScrollView
                contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00695C']} />
                }
            >
                {filteredMedicines.length === 0 ? (
                    <View className="items-center mt-[60px]">
                        <FontAwesome5 name="leaf" size={50} color="#ccc" />
                        <Text className="mt-[15px] text-base text-[#999]">No medicines found.</Text>
                    </View>
                ) : (
                    <View className={`flex-row flex-wrap ${viewMode === 'grid' ? 'justify-between' : ''}`}>
                        {filteredMedicines.map((item, index) => (
                            <View key={item.medicineid || index} style={{ width: viewMode === 'grid' ? '48%' : '100%' }}>
                                <MedicineItem
                                    item={item}
                                    viewMode={viewMode}
                                    onNavigate={handleNavigate}
                                    onAddToCart={handleAddToCart}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

// --- RAW STYLES TO AVOID NATIVEWIND CRASH ---
const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        marginRight: 8,
    },
    categoryButtonActive: {
        backgroundColor: '#00695C',
        borderColor: '#00695C',
    },
    categoryButtonInactive: {
        backgroundColor: '#fff',
        borderColor: '#E0E0E0',
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#fff',
    },
    categoryTextInactive: {
        color: '#666',
    },
    // Grid Item Styles
    gridItemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#F1F1F1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    gridImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 2,
    },
    itemCategory: {
        fontSize: 11,
        color: '#00796B',
        marginBottom: 8,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2E7D32',
    },
    addButton: {
        backgroundColor: '#E0F2F1',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#B2DFDB',
    },
    addButtonText: {
        color: '#00796B',
        fontWeight: 'bold',
        fontSize: 11,
    },
    // List Item Styles
    listItemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    listImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    listContent: {
        flex: 1,
        marginLeft: 15,
        height: 100,
        justifyContent: 'space-between',
    },
    itemDescription: {
        fontSize: 13,
        color: '#78909C',
        marginTop: 4,
        lineHeight: 18,
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    addToCartButton: {
        backgroundColor: '#00695C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addToCartText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default SanjeevaniStoreScreen;
