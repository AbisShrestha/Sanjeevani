import api from './api';

/* 
   TYPES
   Define what a "Medicine" looks like so Typescript can help us avoid typos.
 */
export interface AddMedicinePayload {
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description?: string | null;
  dosage?: string | null;
  benefits?: string | null;
  usageInstructions?: string | null;
  precautions?: string | null;
  imageUrl?: string | null;
}

/* 
   GET ALL MEDICINES (with optional server-side search)
   Supports query params: search, category, sort
 */
export const getAllMedicines = async (params?: {
  search?: string;
  category?: string;
  sort?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category && params.category.toLowerCase() !== 'all') {
    queryParams.append('category', params.category);
  }
  if (params?.sort && params.sort !== 'none') {
    queryParams.append('sort', params.sort);
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `/medicines?${queryString}` : '/medicines';
  
  const response = await api.get(url);
  return response.data;
};

/* 
   DELETE MEDICINE
   Tell the server to permanently remove a medicine by its ID.
 */
export const deleteMedicine = async (medicineId: number) => {
  const response = await api.delete(`/medicines/${medicineId}`);
  return response.data;
};

/* 
   ADD MEDICINE
   Send new medicine data to the server to save it to the database.
 */
export const addMedicine = async (data: AddMedicinePayload) => {
  const response = await api.post('/medicines', data);
  return response.data;
};

/* 
   UPDATE MEDICINE
   Send modified data to update an existing medicine.
 */
export const updateMedicine = async (
  medicineId: number,
  data: Partial<AddMedicinePayload>
) => {
  const response = await api.put(`/medicines/${medicineId}`, data);
  return response.data;
};

/* 
   GET LOW STOCK MEDICINES (ADMIN)
 */
export const getLowStockMedicines = async (search = '') => {
  const url = search ? `/medicines/admin/low-stock?search=${encodeURIComponent(search)}` : '/medicines/admin/low-stock';
  const response = await api.get(url);
  return response.data;
};
