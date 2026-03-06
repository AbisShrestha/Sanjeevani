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
   Automatically detects the IP address of the computer running the Expo server.
   This prevents "Network Error" when WiFi IP changes.
*/
const getBackendUrl = () => {
  return 'https://pdtuy-2001-df4-2b40-c78c-d1ca-eabd-e0fa-4bf3.a.free.pinggy.link';
};

export const SERVER_URL = getBackendUrl();
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

console.log('DEBUG: API BASE URL set to:', BASE_URL);

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
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.set('Authorization', `Bearer ${authToken}`);
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
