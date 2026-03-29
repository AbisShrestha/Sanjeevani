const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware'); // Must be authenticated to order

/**
 * Order Routes
 * Mounted at /api/orders
 */

// POST: Create a new order
router.post('/', verifyToken, orderController.placeOrder);

// GET: Retrieve logged in user's order history
router.get('/my-orders', verifyToken, orderController.getMyOrders);

// GET: Admin - Retrieve all orders
router.get('/', verifyToken, authorizeRoles('admin'), orderController.getAllOrders);

// PUT: Admin - Update order status
router.put('/:id/status', verifyToken, authorizeRoles('admin'), orderController.updateOrderStatus);

// DELETE: User - Cancel pending order (restore stock if eSewa fails)
router.delete('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
