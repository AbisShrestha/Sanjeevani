import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { InternalAxiosRequestConfig } from 'axios';

/* 
   BASE URL SETUP
   This tells the app where the backend server lives.
   - On Android Emulator, 'localhost' is 10.0.2.2
   - On iOS or Web, 'localhost' works fine
*/
// For Physical Device testing (Both Android & iOS), use the Computer's LAN IP
// export const SERVER_URL = 'https://kztip-160-30-132-192.a.free.pinggy.link';
import Constants from 'expo-constants';

/* 
   BASE URL SETUP (DYNAMIC)
   The backend's start-tunnel.js automatically writes the live tunnel URL into the .env file.
   Expo automatically loads it here!
*/
export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
export const BASE_URL = `${SERVER_URL}/api`;

// Create a configured "Axios" instance (our internet browser for code)
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Wait 30 seconds before giving up
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true',
  },
});



/* 
   TOKEN MANAGEMENT
   We need to remember who the user is using a "Token".
*/
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// When app starts, try to find the saved token from phone storage
AsyncStorage.getItem('token')
  .then(token => {
    authToken = token;
  })
  .catch(() => {
    authToken = null;
  });

/*
   REQUEST INTERCEPTOR
   Before any request leaves the phone:
   1. Check if we have a token.
   2. If yes, stamp it onto the message (Authorization Header).
   This lets the backend know we are logged in.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // If memory token is null, try to grab it directly from storage (covers fast-refresh cases)
    if (!authToken) {
      authToken = await AsyncStorage.getItem('token');
    }
    
    if (authToken) {
      // Direct assignment instead of .set() which can be buggy in older RN + Axios versions
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/* 
   RESPONSE INTERCEPTOR
   When the server replies:
   1. If the reply is successful, just pass it through.
   2. If the server says "401 Unauthorized" (Token invalid), logout the user.
   3. Log errors if we are in development mode.
 */
api.interceptors.response.use(
  response => response,
  async error => {
    if (__DEV__) {
      console.log(
        'AXIOS ERROR >>>',
        error.response?.status,
        error.response?.data || error.message
      );
    }

    // Force Logout if token is bad
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      authToken = null;
    }

    return Promise.reject(error);
  }
);

export default api;
