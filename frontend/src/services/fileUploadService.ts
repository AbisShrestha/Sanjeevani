import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { SERVER_URL } from './api';

// Upload image to server
import AsyncStorage from '@react-native-async-storage/async-storage';

export const uploadImage = async (asset: ImagePicker.ImagePickerAsset, folder?: string) => {
  if (!asset || !asset.uri) {
    return null;
  }

  const formData = new FormData();

  const filename = asset.fileName || asset.uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // @ts-ignore
  formData.append('file', { uri: asset.uri, name: filename, type });

  // Explicitly fetch token since transformRequest might strip the interceptor headers
  const token = await AsyncStorage.getItem('token');

  try {
    const url = folder ? `/upload?folder=${encodeURIComponent(folder)}` : '/upload';
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      transformRequest: (data, headers) => {
        return formData;
      },
    });


    // Backend returns relative path like "/uploads/abc.jpg"
    return `${SERVER_URL}${response.data.fileUrl}`;

  } catch (error: any) {
    console.error("Upload Error:", error);
    throw new Error(error.response?.data?.message || error.message || 'Upload failed');
  }
};
