const orderModel = require('../models/orderModel');

/**
 * POST /api/orders
 * Create a new order after successful payment.
 */
const placeOrder = async (req, res) => {
  try {
    const { totalAmount, shippingAddress, items, paymentStatus, orderStatus } = req.body;
    
    // User is extracted from auth middleware
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const newOrder = await orderModel.createOrder(
        userId, 
        totalAmount, 
        shippingAddress, 
        items, 
        paymentStatus || 'Completed', 
        orderStatus || 'Processing'
    );

    // Step: Simulated Customer Notification Task
    // In a production environment, this would hit an SMTP server (SendGrid/Mailgun)
    console.log(`\n[SYSTEM EVENT] New Order: ${newOrder.orderid}`);
    console.log(`[EMAIL SERVICE] Sending receipt to: ${req.user.email || 'user@example.com'}`);
    console.log(`[EMAIL SERVICE] Content: "Your Sanjeevani Order #${newOrder.orderid} is being processed!"\n`);

    res.status(201).json({
      message: 'Order placed successfully. Confirmation email sent.',
      order: newOrder,
    });
  } catch (error) {
    if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('not found'))) {
        return res.status(400).json({ error: error.message });
    }
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
 * Supports: ?search=text
 */
const getAllOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const orders = await orderModel.getAllOrders(search);
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

    const validStatuses = ['Processing', 'Approved', 'Shipped', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
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

const cancelOrder = async (req, res) => {
  const pool = require('../config/db');
  const client = await pool.connect();
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    await client.query('BEGIN');

    // Make sure the order belongs to the user and is 'Pending Payment'
    const orderCheck = await client.query("SELECT orderstatus FROM orders WHERE orderid = $1 AND userid = $2 FOR UPDATE", [orderId, userId]);
    if (orderCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Order not found' });
    }

    if (orderCheck.rows[0].orderstatus !== 'Pending Payment') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Only pending orders can be cancelled automatically' });
    }

    // 1. Mark as cancelled
    await client.query("UPDATE orders SET paymentstatus = 'Cancelled', orderstatus = 'Cancelled' WHERE orderid = $1", [orderId]);

    // 2. Restore stock atomically
    const items = await client.query("SELECT medicineid, quantity FROM order_items WHERE orderid = $1", [orderId]);
    for (const item of items.rows) {
        await client.query("UPDATE medicines SET stock = stock + $1 WHERE medicineid = $2", [item.quantity, item.medicineid]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Order cancelled and stock restored' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
