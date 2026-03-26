import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumInput } from '../components/PremiumInput';
import { useMedicineTracker } from '../context/MedicineTrackerContext';

const AddMedicineTrackerScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets();
  const { addTrackedMedicine } = useMedicineTracker();

  // Pre-fill if navigated from MedicineDetailsScreen
  const prefill = route?.params?.medicine;

  const [name, setName] = useState(prefill?.name || '');
  const [totalQty, setTotalQty] = useState(prefill?.stock?.toString() || '');
  const [dosagePerDay, setDosagePerDay] = useState('');
  const [reminderDays, setReminderDays] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter the medicine name.');
      return;
    }
    if (!totalQty || isNaN(Number(totalQty)) || Number(totalQty) <= 0) {
      Alert.alert('Error', 'Please enter a valid total quantity.');
      return;
    }
    if (!dosagePerDay || isNaN(Number(dosagePerDay)) || Number(dosagePerDay) <= 0) {
      Alert.alert('Error', 'Please enter how many you take per day.');
      return;
    }

    const qty = Number(totalQty);
    const dosage = Number(dosagePerDay);
    const remind = Number(reminderDays) || 3;
    const totalDays = Math.ceil(qty / dosage);

    try {
      setLoading(true);
      await addTrackedMedicine({
        name: name.trim(),
        imageUrl: prefill?.imageurl || null,
        totalQty: qty,
        dosagePerDay: dosage,
        startDate: new Date().toISOString(),
        reminderDaysBefore: remind,
      });

      Alert.alert(
        '✅ Tracking Started!',
        `"${name.trim()}" will last ~${totalDays} days.\nYou'll be reminded ${remind} days before it runs out.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save tracking data.');
    } finally {
      setLoading(false);
    }
  };

  const previewDays = (totalQty && dosagePerDay && Number(dosagePerDay) > 0)
    ? Math.ceil(Number(totalQty) / Number(dosagePerDay))
    : null;

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View
        className="bg-[#00695C] pb-5 px-6 rounded-b-[30px] shadow-md"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10) }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-[22px] font-extrabold text-white">Track Medicine</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          {/* Info Card */}
          <View className="bg-[#E0F2F1] rounded-[16px] p-4 flex-row items-center mb-6 border border-[#B2DFDB]">
            <FontAwesome5 name="info-circle" size={18} color="#00695C" />
            <Text className="text-[13px] text-[#004D40] ml-3 flex-1 leading-5">
              Track your medicine stock and get notified automatically before it runs out!
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-[16px] p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-[#37474F] mb-5 border-b border-[#ECEFF1] pb-2.5">
              Medicine Details
            </Text>

            <PremiumInput
              label="Medicine Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ashwagandha Capsules"
            />

            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <PremiumInput
                  label="Total Quantity *"
                  value={totalQty}
                  onChangeText={setTotalQty}
                  keyboardType="numeric"
                  placeholder="e.g. 30"
                />
              </View>
              <View className="w-[48%]">
                <PremiumInput
                  label="Dosage Per Day *"
                  value={dosagePerDay}
                  onChangeText={setDosagePerDay}
                  keyboardType="numeric"
                  placeholder="e.g. 2"
                />
              </View>
            </View>

            <PremiumInput
              label="Remind Me (days before)"
              value={reminderDays}
              onChangeText={setReminderDays}
              keyboardType="numeric"
              placeholder="e.g. 3"
            />
          </View>

          {/* Preview Card */}
          {previewDays !== null && (
            <View className="bg-white rounded-[16px] p-5 mb-5 shadow-sm border border-[#E8F5E9]">
              <Text className="text-lg font-bold text-[#37474F] mb-4">📊 Estimation Preview</Text>

              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <FontAwesome5 name="calendar-alt" size={16} color="#00695C" />
                  <Text className="text-[15px] text-[#455A64] ml-2 font-medium">Will last for</Text>
                </View>
                <Text className="text-[20px] font-extrabold text-[#00695C]">{previewDays} days</Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <FontAwesome5 name="bell" size={16} color="#FFA000" />
                  <Text className="text-[15px] text-[#455A64] ml-2 font-medium">Reminder in</Text>
                </View>
                <Text className="text-[20px] font-extrabold text-[#FFA000]">
                  {Math.max(0, previewDays - (Number(reminderDays) || 3))} days
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <FontAwesome5 name="clock" size={16} color="#D32F2F" />
                  <Text className="text-[15px] text-[#455A64] ml-2 font-medium">Runs out on</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#D32F2F]">
                  {new Date(Date.now() + previewDays * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-[#ECEFF1] shadow-xl">
        <TouchableOpacity
          className="bg-[#00695C] py-4 rounded-[16px] items-center shadow-sm"
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text className="text-white font-bold text-base tracking-wide">
            {loading ? 'Saving...' : '💊 Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddMedicineTrackerScreen;
