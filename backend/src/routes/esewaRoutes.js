const express = require('express');
const router = express.Router();
const esewaController = require('../controllers/esewaController');

/**
 * eSewa Payment Routes
 * POST /api/esewa/initiate  — Generate signed payment data
 * POST /api/esewa/verify    — Verify completed transaction
 */
router.post('/initiate', esewaController.initiatePayment);
router.post('/verify', esewaController.verifyPayment);

module.exports = router;
