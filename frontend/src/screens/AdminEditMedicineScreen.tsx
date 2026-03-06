import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../services/api';
import { buildImageUri } from '../utils/image';
import * as ImagePicker from 'expo-image-picker';

/* 
   CATEGORY OPTIONS (Same as Add Screen)
 */
const CATEGORY_OPTIONS = [
  { id: '1', name: 'Herbs' },
  { id: '2', name: 'Capsule' },
  { id: '3', name: 'Tablet' },
  { id: '4', name: 'Oil' },
  { id: '5', name: 'Syrup' },
  { id: '6', name: 'Powder' },
];

/* 
   SCREEN
 */

const AdminEditMedicineScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  // Using props instead of hooks
  const { medicine } = route.params;

  const [name, setName] = useState(medicine.name);
  const [price, setPrice] = useState(medicine.price.toString());
  const [stock, setStock] = useState(medicine.stock.toString());
  const [description, setDescription] = useState(medicine.description || '');
  const [category, setCategory] = useState(medicine.category || 'Herbs');
  const [image, setImage] = useState(medicine.imageurl);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  // Upload to Backend
  const uploadImage = async (uri: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'medicine.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data.imageUrl); // Path from server
    } catch (error) {
      Alert.alert("Upload Failed", "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/medicines/${medicine.medicineid}`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        category,
        imageurl: image
      });
      Alert.alert("Success", "Medicine updated!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update medicine.");
    } finally {
      setLoading(false);
    }
  };

  const displayImage = buildImageUri(image);

  return (
    <ScrollView className="flex-1 bg-[#F5F7FA]">
      <View className="p-5">
        {/* Image Upload */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image
              source={{ uri: displayImage || 'https://via.placeholder.com/150' }}
              className="w-[120px] h-[120px] rounded-2xl bg-[#eee]"
              resizeMode="contain"
            />
            <View className="absolute -bottom-2 -right-2 bg-[#00695C] p-2 rounded-full border-[3px] border-white">
              <FontAwesome5 name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          {uploading && <ActivityIndicator color="#00695C" className="mt-2" />}
        </View>

        {/* Form */}
        <View className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
          <View>
            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Medicine Name</Text>
            <TextInput
              className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ashwagandha"
            />
          </View>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-xs font-bold text-[#666] uppercase mb-1">Price (₹)</Text>
              <TextInput
                className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View className="w-[48%]">
              <Text className="text-xs font-bold text-[#666] uppercase mb-1">Stock Qty</Text>
              <TextInput
                className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Category</Text>
            <TextInput
              className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-[#666] uppercase mb-1">Description</Text>
            <TextInput
              className="bg-[#F5F7FA] p-3 rounded-xl text-[#333] text-base h-[100px]"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-[#00695C] py-4 rounded-xl mt-6 shadow-md shadow-[#00695C]/30 flex-row justify-center items-center"
          onPress={handleUpdate}
          disabled={loading || uploading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="save" size={18} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">Update Medicine</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

/*
   CUSTOM DROPDOWN COMPONENT (Modal Based)
 */
const CustomDropdown = ({
  options,
  selectedValue,
  onValueChange,
  placeholder,
}: {
  options: { id: string; name: string }[];
  selectedValue: string;
  onValueChange: (val: string) => void;
  placeholder: string;
}) => {
  const [visible, setVisible] = useState(false);

  // Find the name of the selected item
  const selectedItem = options.find(opt => opt.id === selectedValue);

  return (
    <>
      <TouchableOpacity
        className="bg-[#F9FAFB] rounded-xl border border-[#CFD8DC] px-4 py-[14px] flex-row justify-between items-center h-[56px]"
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text className={`text-[15px] ${!selectedItem ? 'text-[#B0BEC5]' : 'text-[#263238]'}`}>
          {selectedItem ? selectedItem.name : placeholder}
        </Text>
        <FontAwesome5 name="chevron-down" size={12} color="#555" />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <TouchableOpacity className="flex-1 bg-black/50 justify-center p-6" activeOpacity={1} onPress={() => setVisible(false)}>
          <View className="bg-white rounded-2xl p-5 max-h-[80%]">
            <Text className="text-lg font-bold mb-4 text-center text-[#37474F]">Select Category</Text>
            <FlatList
              data={options}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-3.5 px-4 border-b border-[#f0f0f0] flex-row justify-between items-center ${item.id === selectedValue ? 'bg-[#E8F5E9] rounded-lg border-b-0' : ''}`}
                  onPress={() => {
                    onValueChange(item.id);
                    setVisible(false);
                  }}
                >
                  <Text className={`text-base ${item.id === selectedValue ? 'text-[#2E7D32] font-semibold' : 'text-[#333]'}`}>
                    {item.name}
                  </Text>
                  {item.id === selectedValue && <FontAwesome5 name="check" size={14} color="#2E7D32" />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity className="mt-4 items-center p-3" onPress={() => setVisible(false)}>
              <Text className="text-[#D32F2F] text-base font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AdminEditMedicineScreen;
