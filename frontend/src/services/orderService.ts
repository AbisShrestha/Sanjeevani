import api from './api';

export interface OrderItem {
  orderitemid: number;
  medicineid: number;
  name: string;
  imageurl: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderid: number;
  userid: number;
  totalamount: number;
  shippingaddress: string;
  paymentmethod: string;
  paymentstatus: string;
  orderstatus: string;
  createdat: string;
  items: OrderItem[];
}

/**
 * Place a new order with standard items
 */
export const placeOrder = async (
  totalAmount: number,
  shippingAddress: string,
  items: { medicineid: number; quantity: number; price: number }[]
) => {
  const response = await api.post('/orders', {
    totalAmount,
    shippingAddress,
    items,
  });
  return response.data;
};

/**
 * Fetch past orders for the logged-in user
 */
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};
