import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMedicineTracker, TrackedMedicine } from '../context/MedicineTrackerContext';

const MyMedicinesScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { trackedMedicines, removeTrackedMedicine, getDaysRemaining, getPercentLeft, loading } = useMedicineTracker();

  const handleRemove = (med: TrackedMedicine) => {
    Alert.alert(
      'Stop Tracking',
      `Remove "${med.name}" from your tracked medicines?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTrackedMedicine(med.id),
        },
      ]
    );
  };

  const handleReorder = (med: TrackedMedicine) => {
    navigation.navigate('Store');
  };

  const getProgressColor = (percent: number) => {
    if (percent > 50) return '#43A047';
    if (percent > 25) return '#FFA000';
    return '#D32F2F';
  };

  const getStatusLabel = (daysLeft: number) => {
    if (daysLeft === 0) return { text: 'FINISHED', color: '#D32F2F', bg: '#FFEBEE' };
    if (daysLeft <= 3) return { text: 'CRITICAL', color: '#D32F2F', bg: '#FFEBEE' };
    if (daysLeft <= 7) return { text: 'LOW', color: '#FFA000', bg: '#FFF8E1' };
    return { text: 'OK', color: '#43A047', bg: '#E8F5E9' };
  };

  const renderItem = ({ item }: { item: TrackedMedicine }) => {
    const daysLeft = getDaysRemaining(item);
    const percent = getPercentLeft(item);
    const progressColor = getProgressColor(percent);
    const status = getStatusLabel(daysLeft);
    const totalDays = Math.ceil(item.totalQty / item.dosagePerDay);
    const qtyLeft = Math.max(0, Math.round(item.totalQty * (percent / 100)));

    return (
      <View className="bg-white rounded-[20px] p-5 mb-4 shadow-sm border border-[#F0F0F0]">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-[44px] h-[44px] rounded-full bg-[#E8F5E9] justify-center items-center mr-3">
              <FontAwesome5 name="capsules" size={20} color="#00695C" />
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-[#263238]" numberOfLines={1}>{item.name}</Text>
              <Text className="text-[13px] text-[#78909C] mt-0.5">{item.dosagePerDay} {item.unit || 'Pills'} per day • {item.totalQty} {item.unit || 'Pills'} total</Text>
            </View>
          </View>
          <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: status.bg }}>
            <Text className="text-[11px] font-bold" style={{ color: status.color }}>{status.text}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-[12px] text-[#90A4AE] font-medium">{qtyLeft} {item.unit || 'Pills'} left</Text>
            <Text className="text-[12px] font-bold" style={{ color: progressColor }}>{daysLeft} days left</Text>
          </View>
          <View className="h-[8px] bg-[#ECEFF1] rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${Math.max(2, percent)}%`, backgroundColor: progressColor }}
            />
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-between mt-2">
          <TouchableOpacity
            className="flex-row items-center bg-[#E8F5E9] py-2.5 px-4 rounded-xl flex-1 mr-2 justify-center"
            onPress={() => handleReorder(item)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="redo" size={12} color="#00695C" />
            <Text className="text-[#00695C] font-bold text-[13px] ml-2">Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center bg-[#FFEBEE] py-2.5 px-4 rounded-xl justify-center"
            onPress={() => handleRemove(item)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="trash" size={12} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F5F7FA]">
        <ActivityIndicator size="large" color="#00695C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        className="bg-[#00695C] pb-5 px-6 rounded-b-[30px] shadow-md"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-[22px] font-extrabold text-white flex-1">My Medicines</Text>
          <TouchableOpacity
            className="bg-white/20 p-2.5 rounded-xl"
            onPress={() => navigation.navigate('AddMedicineTracker')}
          >
            <FontAwesome5 name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {trackedMedicines.length === 0 ? (
        /* Empty State */
        <View className="flex-1 justify-center items-center px-10">
          <View className="bg-[#E0F2F1] w-[100px] h-[100px] rounded-full justify-center items-center mb-6">
            <FontAwesome5 name="pills" size={40} color="#00695C" />
          </View>
          <Text className="text-[20px] font-bold text-[#37474F] mb-2 text-center">No medicines tracked</Text>
          <Text className="text-[15px] text-[#90A4AE] text-center mb-8 leading-6">
            Start tracking your medicines to get automatic refill reminders before they run out!
          </Text>
          <TouchableOpacity
            className="bg-[#00695C] py-4 px-8 rounded-2xl shadow-md flex-row items-center"
            onPress={() => navigation.navigate('AddMedicineTracker')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="plus" size={14} color="#fff" />
            <Text className="text-white font-bold text-[15px] ml-2">Track a Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trackedMedicines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default MyMedicinesScreen;
