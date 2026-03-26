import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { SERVER_URL } from './api';

/* 
  This function uploads an image to YOUR backend server.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';

export const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
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
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      transformRequest: (data, headers) => {
        return formData;
      },
    });

    // 4. Return the full URL of the uploaded image
    // Backend returns relative path like "/uploads/abc.jpg"
    return `${SERVER_URL}${response.data.fileUrl}`;

  } catch (error: any) {
    console.error("Upload Error:", error);
    throw new Error(error.response?.data?.message || error.message || 'Upload failed');
  }
};
