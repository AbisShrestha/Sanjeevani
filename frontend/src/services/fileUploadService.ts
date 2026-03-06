import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { SERVER_URL } from './api';

/* 
  This function uploads an image to YOUR backend server.
*/
export const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
  // 1. Check if we have valid image data
  if (!asset || !asset.uri) {
    return null; // Stop if there is no image data
  }

  // 2. Prepare FormData
  const formData = new FormData();

  const filename = asset.fileName || asset.uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // @ts-ignore: FormData in React Native expects an object with uri, name, type
  formData.append('file', { uri: asset.uri, name: filename, type });

  try {
    // 3. Send to Backend using our configured Axios instance (includes Tunnel headers)
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        // Axios hack for React Native FormData
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
