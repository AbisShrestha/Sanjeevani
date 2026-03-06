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

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const activateUser = async (userId: number) => {
  const response = await api.patch(`/admin/users/${userId}/activate`);
  return response.data;
};

export const deactivateUser = async (userId: number) => {
  const response = await api.patch(`/admin/users/${userId}/deactivate`);
  return response.data;
};

/* 
   ORDERS & REPORTS (FUTURE)
 */

export const getAllOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/admin/reports');
  return response.data;
};
