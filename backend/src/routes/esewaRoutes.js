const express = require('express');
const router = express.Router();
const esewaController = require('../controllers/esewaController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * eSewa Payment Routes
 * POST /api/esewa/initiate  — Generate signed payment data (auth required)
 * POST /api/esewa/verify    — Verify completed transaction (auth required)
 */
router.post('/initiate', verifyToken, esewaController.initiatePayment);
router.post('/verify', verifyToken, esewaController.verifyPayment);

module.exports = router;
