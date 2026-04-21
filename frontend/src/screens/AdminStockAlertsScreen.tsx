import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getLowStockMedicines, updateMedicine } from '../services/medicineService';
import { buildImageUri } from '../utils/image';

const AdminStockAlertsScreen = ({ navigation }: { navigation: any }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // States for inline quick update
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<string>('');
  const [updatingParams, setUpdatingParams] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const fetchAlerts = async () => {
    try {
      if (!refreshing && !debouncedSearch && alerts.length === 0) setLoading(true);
      if (debouncedSearch) setIsSearching(true);
      const data = await getLowStockMedicines(debouncedSearch);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error);
      Alert.alert('Error', 'Could not load stock alerts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [debouncedSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, []);

  const handleUpdateStock = async (medicineId: number) => {
    const newStock = parseInt(editStockValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid stock number.');
      return;
    }

    try {
      setUpdatingParams(true);
      await updateMedicine(medicineId, { stock: newStock });
      
      // Remove from list or update local state
      // Easiest is to just re-fetch to ensure sync with server thresholds
      setEditingId(null);
      setEditStockValue('');
      await fetchAlerts();
      
      Alert.alert('Success', 'Stock updated successfully!');
    } catch (error) {
      console.error('Failed to update stock:', error);
      Alert.alert('Error', 'Failed to update stock.');
    } finally {
      setUpdatingParams(false);
    }
  };

  const startEditing = (medicine: any) => {
    setEditingId(medicine.medicineid);
    setEditStockValue(medicine.stock.toString());
  };

  const getSeverityStyle = (stock: number, threshold: number) => {
    const actualThreshold = threshold || 10;
    if (stock === 0) return { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#FFCDD2]', label: 'OUT OF STOCK' };
    if (stock <= actualThreshold / 2) return { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', border: 'border-[#FFE0B2]', label: 'CRITICAL LOW' };
    return { bg: 'bg-[#FFFDE7]', text: 'text-[#F57F17]', border: 'border-[#FFF9C4]', label: 'LOW STOCK' };
  };

  const renderItem = ({ item }: { item: any }) => {
    const severity = getSeverityStyle(item.stock, item.lowstockthreshold);
    const isEditing = editingId === item.medicineid;

    return (
      <View className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border ${severity.border} overflow-hidden`}>
        {/* Severity Badge */}
        <View className="flex-row justify-between items-center mb-3">
          <View className={`${severity.bg} px-3 py-1 rounded-full flex-row items-center border ${severity.border}`}>
            <FontAwesome5 name="exclamation-circle" size={12} color={severity.text.replace('text-[', '').replace(']', '')} />
            <Text className={`${severity.text} text-[10px] font-extrabold ml-1.5`}>{severity.label}</Text>
          </View>
          <Text className="text-[#90A4AE] text-xs font-semibold">Threshold: {item.lowstockthreshold || 10}</Text>
        </View>

        <View className="flex-row">
          <Image 
            source={{ uri: buildImageUri(item.imageurl)! }} 
            className="w-[70px] h-[70px] rounded-xl bg-[#FAFAFA] border border-[#F5F5F5]" 
            resizeMode="contain" 
          />
          <View className="ml-3 flex-1 justify-center">
            <Text className="text-base font-bold text-[#37474F] mb-1" numberOfLines={1}>{item.name}</Text>
            <Text className="text-[#00695C] font-semibold text-xs mb-1">{item.categoryname || 'Uncategorized'}</Text>
            
            {!isEditing ? (
              <View className="flex-row items-baseline mt-1">
                <Text className="text-[#37474F] text-sm font-medium mr-1">Current Stock:</Text>
                <Text className={`text-lg font-extrabold ${severity.text}`}>{item.stock}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Quick Action Area */}
        {isEditing ? (
           <View className="mt-4 bg-[#F5F7FA] p-3 rounded-xl border border-[#ECEFF1] flex-row items-center">
             <Text className="text-[#37474F] font-semibold mr-3">New Stock:</Text>
             <TextInput
               className="bg-white border border-[#CFD8DC] rounded-lg px-3 py-2 flex-1 text-center font-bold text-[#333]"
               keyboardType="numeric"
               value={editStockValue}
               onChangeText={setEditStockValue}
               autoFocus
             />
             <View className="flex-row ml-3">
               <TouchableOpacity 
                 className="w-10 h-10 bg-[#E0E0E0] rounded-xl justify-center items-center mr-2"
                 onPress={() => setEditingId(null)}
               >
                 <FontAwesome5 name="times" size={14} color="#616161" />
               </TouchableOpacity>
               <TouchableOpacity 
                 className="w-10 h-10 bg-[#00695C] rounded-xl justify-center items-center shadow-sm"
                 onPress={() => handleUpdateStock(item.medicineid)}
                 disabled={updatingParams}
               >
                 {updatingParams ? (
                   <ActivityIndicator size="small" color="#fff" />
                 ) : (
                   <FontAwesome5 name="check" size={14} color="#fff" />
                 )}
               </TouchableOpacity>
             </View>
           </View>
        ) : (
           <TouchableOpacity 
             className="mt-4 bg-white border border-[#00695C] py-2.5 rounded-xl flex-row justify-center items-center"
             onPress={() => startEditing(item)}
           >
             <FontAwesome5 name="box-open" size={14} color="#00695C" />
             <Text className="text-[#00695C] font-bold text-sm ml-2.5">Update Inventory</Text>
           </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#F5F8FA]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className={`bg-white shadow-sm flex-row items-center px-5 py-4 ${Platform.OS === 'ios' ? 'pt-12' : ''} mb-2`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <FontAwesome5 name="arrow-left" size={20} color="#37474F" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#37474F] ml-4">Stock Alerts</Text>
      </View>

      {/* SEARCH BAR */}
      <View className="bg-white p-3 mx-5 mt-2 mb-2 rounded-xl flex-row items-center border border-[#eee]">
        <FontAwesome5 name="search" size={16} color="#999" />
        <TextInput
          className="flex-1 ml-3 text-[15px] text-[#333]"
          placeholder="Search items by name or category..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {isSearching ? (
          <ActivityIndicator size="small" color="#FF8F00" style={{ padding: 4 }} />
        ) : searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <FontAwesome5 name="times-circle" size={16} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00695C" />
          <Text className="mt-3 text-[#78909C]">Checking inventory levels...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item: any) => (item.medicineid || Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF8F00']} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <View className="w-24 h-24 bg-[#E8F5E9] rounded-full items-center justify-center mb-5 border border-[#C8E6C9]">
                <FontAwesome5 name={searchText ? "search" : "check-double"} size={40} color="#4CAF50" />
              </View>
              <Text className="text-2xl font-extrabold text-[#37474F] mb-2">{searchText ? "No matches" : "All Clear!"}</Text>
              <Text className="text-base text-[#78909C] text-center px-10">
                {searchText ? "No low-stock alerts found for this search." : "Your inventory is healthy. No medicines are currently running low on stock."}
              </Text>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default AdminStockAlertsScreen;
