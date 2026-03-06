import api from './api';

/* 
   LOGIN FUNCTION
   Sends email and password to the server to check if user exists.
 */
export const loginUser = async (email: string, password: string) => {
  // 1. Send the login request (POST) using our configured Axios instance
  const response = await api.post('/auth/login', { email, password });

  // 2. Return the user data and token (Axios automatically parses JSON)
  return response.data;
};

/*
   REGISTER FUNCTION
   Sends new user details to create a new account in our database.
 */
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  // 1. Send the registration request (POST) to backend
  const response = await api.post('/auth/register', userData);

  // 2. Return success message
  return response.data;
};
