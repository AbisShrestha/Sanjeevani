import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PremiumInput } from '../components/PremiumInput';

import { addMedicine } from '../services/medicineService';
import { uploadImage } from '../services/fileUploadService';

const CATEGORY_OPTIONS = [
  { id: '1', name: 'Herbs' },
  { id: '2', name: 'Capsule' },
  { id: '3', name: 'Tablet' },
  { id: '4', name: 'Oil' },
  { id: '5', name: 'Syrup' },
  { id: '6', name: 'Powder' },
];

interface FormState {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  lowStockThreshold: string;
  description: string;
  dosage: string;
  benefits: string;
  usageInstructions: string;
  precautions: string;
}

const AdminAddMedicineScreen = ({ navigation }: { navigation: any }) => {
  // Using props instead of useNavigation hook
  const [loading, setLoading] = useState(false);
  const [imageResponse, setImageResponse] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    description: '',
    dosage: '',
    benefits: '',
    usageInstructions: '',
    precautions: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'image', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const validateField = (key: keyof FormState, value: string) => {
    let error = '';
    switch (key) {
      case 'name':
        if (!value.trim()) error = 'Medicine Name is required';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'price':
        if (!value) error = 'Price is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) error = 'Price must be a positive number';
        break;
      case 'stock':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) error = 'Stock cannot be negative';
        break;
      case 'categoryId':
        if (!value) error = 'Category is required';
        break;
    }
    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const updateField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      validateField(key, value);
    }
  };

  const handleBlur = (key: keyof FormState) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    validateField(key, form[key]);
  };

  const pickImage = async () => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageResponse(result.assets[0]);
      setImageUri(result.assets[0].uri);
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const openCamera = async () => {
    // Request permission logic handled by Expo usually, but explicit request is safer
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Invalid', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageResponse(result.assets[0]);
      setImageUri(result.assets[0].uri);
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleSubmit = async () => {
    // 1. Run full validation
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.categoryId) newErrors.categoryId = 'Category is required';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!imageResponse) newErrors.image = 'Product image is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, price: true, categoryId: true });
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImage(imageResponse!);

      await addMedicine({
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock || 0),
        lowStockThreshold: Number(form.lowStockThreshold),
        description: form.description || null,
        dosage: form.dosage || null,
        benefits: form.benefits || null,
        usageInstructions: form.usageInstructions || null,
        precautions: form.precautions || null,
        imageUrl: imageUrl,
      });

      Alert.alert('Success', 'Medicine added successfully');
      navigation.goBack();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add medicine';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View className="mb-6">
            <Text className="text-[28px] font-extrabold text-[#1B5E20] mb-1">Add New Medicine</Text>
            <Text className="text-sm text-[#78909C]">Fill in the details below.</Text>
          </View>

          <TouchableOpacity
            className={`h-[180px] bg-white rounded-[20px] mb-6 overflow-hidden shadow-sm ${errors.image ? 'border-2 border-[#D32F2F]' : ''}`}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
            ) : (
              <View className="flex-1 justify-center items-center bg-[#E8F5E9]">
                <View className="w-[50px] h-[50px] rounded-full bg-white justify-center items-center mb-3">
                  <FontAwesome5 name="camera" size={24} color={errors.image ? "#D32F2F" : "#2E7D32"} />
                </View>
                <Text className={`text-base font-semibold ${errors.image ? 'text-[#D32F2F]' : 'text-[#2E7D32]'}`}>
                  {errors.image ? 'Image Required' : 'Tap to upload image'}
                </Text>
              </View>
            )}
            {imageUri && (
              <View className="absolute bottom-3 right-3 bg-black/60 p-2 rounded-[20px]">
                <FontAwesome5 name="pen" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View className="bg-white rounded-[16px] p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-[#37474F] mb-5 border-b border-[#ECEFF1] pb-2.5">Basic Information</Text>

            <PremiumInput
              label="Medicine Name *"
              value={form.name}
              onChangeText={v => updateField('name', v)}
              onBlur={() => handleBlur('name')}
              error={errors.name}
              touched={touched.name}
            />

            <Text className="text-[13px] font-semibold text-[#546E7A] mb-2 ml-1">Category *</Text>
            <CustomDropdown
              options={CATEGORY_OPTIONS}
              selectedValue={form.categoryId}
              onValueChange={(v: string) => updateField('categoryId', v)}
              placeholder="Select Category..."
              error={errors.categoryId}
            />
          </View>

          <View className="bg-white rounded-[16px] p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-[#37474F] mb-5 border-b border-[#ECEFF1] pb-2.5">Inventory & Pricing</Text>
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <PremiumInput
                  label="Price (Rs.) *"
                  value={form.price}
                  onChangeText={v => updateField('price', v)}
                  onBlur={() => handleBlur('price')}
                  keyboardType="numeric"
                  error={errors.price}
                  touched={touched.price}
                />
              </View>
              <View className="w-[48%]">
                <PremiumInput
                  label="Stock Qty"
                  value={form.stock}
                  onChangeText={v => updateField('stock', v)}
                  onBlur={() => handleBlur('stock')}
                  keyboardType="numeric"
                  error={errors.stock}
                  touched={touched.stock}
                />
              </View>
            </View>

            <PremiumInput
              label="Low Stock Alert"
              value={form.lowStockThreshold}
              onChangeText={v => updateField('lowStockThreshold', v)}
              keyboardType="numeric"
            />
          </View>

          <View className="bg-white rounded-[16px] p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-[#37474F] mb-5 border-b border-[#ECEFF1] pb-2.5">Medical Details</Text>
            <PremiumInput label="Description" value={form.description} onChangeText={v => updateField('description', v)} multiline />
            <PremiumInput label="Dosage" value={form.dosage} onChangeText={v => updateField('dosage', v)} multiline />
            <PremiumInput label="Usage Instructions" value={form.usageInstructions} onChangeText={v => updateField('usageInstructions', v)} multiline />
            <PremiumInput label="Benefits" value={form.benefits} onChangeText={v => updateField('benefits', v)} multiline />
            <PremiumInput label="Precautions" value={form.precautions} onChangeText={v => updateField('precautions', v)} multiline />
          </View>

          <View className="h-[100px]" />
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-[#ECEFF1] shadow-xl">
        <TouchableOpacity
          className="bg-[#2E7D32] py-4 rounded-[16px] items-center shadow-sm"
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base tracking-wide">Save Medicine</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... custom dropdown remains similar but styled ...
const CustomDropdown = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
  error,
}: any) => {
  const [visible, setVisible] = useState(false);
  const selectedItem = options.find((opt: any) => opt.id === selectedValue);

  return (
    <>
      <TouchableOpacity
        className={`bg-[#F9FAFB] rounded-xl border px-4 py-[14px] flex-row justify-between items-center mb-1 h-[56px] ${error ? 'border-[#D32F2F] border-2' : 'border-[#CFD8DC]'}`}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text className={`text-[15px] ${!selectedItem ? 'text-[#B0BEC5]' : 'text-[#263238]'}`}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <FontAwesome5 name="chevron-down" size={12} color="#555" />
      </TouchableOpacity>
      {error && <Text className="text-[#D32F2F] text-xs mt-1 ml-1">• {error}</Text>}

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center p-5" activeOpacity={1} onPress={() => setVisible(false)}>
          <View className="bg-white rounded-[16px] w-full max-h-[60%] p-5 shadow-lg">
            <Text className="text-lg font-bold text-[#37474F] mb-4 text-center">Select Category</Text>
            <FlatList
              data={options}
              keyExtractor={(item: any) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row justify-between items-center py-[14px] border-b border-[#ECEFF1] ${item.id === selectedValue ? 'bg-[#F1F8E9] px-2.5 rounded-lg' : ''}`}
                  onPress={() => {
                    onValueChange(item.id);
                    setVisible(false);
                  }}
                >
                  <Text className={`text-base ${item.id === selectedValue ? 'text-[#2E7D32] font-bold' : 'text-[#455A64]'}`}>
                    {item.name}
                  </Text>
                  {item.id === selectedValue && <FontAwesome5 name="check" size={14} color="#2E7D32" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AdminAddMedicineScreen;
