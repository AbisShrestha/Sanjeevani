import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  TextInput
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

import { getAllMedicines, deleteMedicine } from '../services/medicineService';
import { buildImageUri } from '../utils/image';

/* 
   TYPES
 */

interface Medicine {
  medicineid: number;
  name: string;
  price: number;
  stock: number;
  lowstockthreshold: number;
  isactive: boolean;
  imageurl?: string | null;
}

/* 
   SCREEN
*/

const AdminMedicinesScreen = ({ navigation }: { navigation: any }) => {
  // Using props instead of useNavigation hook

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  /* 
     LOAD DATA
   */

  const [searchText, setSearchText] = useState('');

  const loadMedicines = async (search = '') => {
    try {
      setLoading(true);
      const data = await getAllMedicines({ search });
      setMedicines(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Failed to load medicines');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Search effect (debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadMedicines(searchText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines(searchText);
  };

  /* 
     DELETE (PERMANENT)
   */
  const confirmDelete = (medicine: Medicine) => {
    Alert.alert(
      'Delete Medicine',
      `Permanently delete "${medicine.name}"?\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicine(medicine.medicineid);
              setMedicines((prev) =>
                prev.filter((m) => m.medicineid !== medicine.medicineid)
              );
            } catch {
              Alert.alert('Error', 'Failed to delete medicine');
            }
          },
        },
      ]
    );
  };

  /* 
     RENDER ITEM
   */
  const renderItem = ({ item }: { item: Medicine }) => {
    const isLowStock = item.stock <= (item.lowstockthreshold || 10);
    const imageUri = buildImageUri(item.imageurl, 'https://via.placeholder.com/150');

    return (
      <View className="bg-white rounded-2xl p-3.5 mb-3.5 shadow-sm">
        <View className="flex-row">
          <Image
            source={{ uri: imageUri }}
            className="w-[70px] h-[70px] rounded-xl bg-[#eee]"
          />
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold flex-1" numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold overflow-hidden ${isLowStock ? 'bg-[#FFE5E5] text-[#C62828]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}
              >
                {isLowStock ? 'Low Stock' : 'In Stock'}
              </Text>
            </View>
            <Text className="text-[13px] text-[#555] mt-1">Price: ₹ {item.price}</Text>
            <Text className="text-[13px] text-[#555]">Stock: {item.stock}</Text>
            <View className="flex-row justify-end mt-3">
              <TouchableOpacity
                className="flex-row items-center mr-5"
                onPress={() =>
                  navigation.navigate('AdminEditMedicine', { medicine: item })
                }
              >
                <FontAwesome5 name="edit" size={14} color="#1976D2" />
                <Text className="ml-1.5 text-[#1976D2] font-semibold">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => confirmDelete(item)}
              >
                <FontAwesome5 name="trash" size={14} color="#D32F2F" />
                <Text className="ml-1.5 text-[#D32F2F] font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]">

      {/* SEARCH BAR */}
      <View className="bg-white p-3 mx-4 mt-4 mb-2 rounded-xl flex-row items-center border border-[#eee]">
        <FontAwesome5 name="search" size={16} color="#999" />
        <TextInput
          className="flex-1 ml-3 text-[15px] text-[#333]"
          placeholder="Search medicines..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <FontAwesome5 name="times-circle" size={16} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CONTENT */}
      {medicines.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          {loading ? (
            <ActivityIndicator size="large" color="#2E7D32" />
          ) : (
            <Text className="text-[#777]">
              {searchText ? 'No matches found' : 'No medicines added yet'}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item: any) => (item.medicineid || Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
            />
          }
        />
      )}


      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#2E7D32] justify-center items-center shadow-lg"
        onPress={() => navigation.navigate('AdminAddMedicine')}
      >
        <FontAwesome5 name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminMedicinesScreen;
