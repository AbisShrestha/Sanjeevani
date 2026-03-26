import api from './api';

/* 
   DASHBOARD
 */

export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats');
  return response.data;
};

/* 
   USER MANAGEMENT
*/

export const getAllUsers = async (search = '') => {
  const url = search ? `/auth/users?search=${encodeURIComponent(search)}` : '/auth/users';
  const response = await api.get(url);
  return response.data;
};

export const activateUser = async (userId: number) => {
  const response = await api.put(`/auth/users/${userId}/status`, { isActive: true });
  return response.data;
};

export const deactivateUser = async (userId: number) => {
  const response = await api.put(`/auth/users/${userId}/status`, { isActive: false });
  return response.data;
};

/* 
   ORDERS & REPORTS (FUTURE)
 */

export const getAllOrders = async (search = '') => {
  const url = search ? `/orders?search=${encodeURIComponent(search)}` : '/orders';
  const response = await api.get(url);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};
