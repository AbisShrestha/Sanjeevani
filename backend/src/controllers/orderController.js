const orderModel = require('../models/orderModel');

/**
 * POST /api/orders
 * Create a new order after successful payment.
 */
const placeOrder = async (req, res) => {
  try {
    const { totalAmount, shippingAddress, items } = req.body;
    
    // User is extracted from auth middleware
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const newOrder = await orderModel.createOrder(userId, totalAmount, shippingAddress, items);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal server error while placing order' });
  }
};

/**
 * GET /api/orders/my-orders
 * Fetch all orders for the currently authenticated user.
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await orderModel.getUserOrders(userId);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
};

/**
 * GET /api/orders
 * Fetch all orders for the admin.
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders admin:', error);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
};

/**
 * PUT /api/orders/:id/status
 * Update the status of an order (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
