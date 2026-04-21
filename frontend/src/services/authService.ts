import api from './api';

// User login authentication
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });


  return response.data;
};

// Register new user account
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const response = await api.post('/auth/register', userData);

  // 2. Return success message
  return response.data;
};
