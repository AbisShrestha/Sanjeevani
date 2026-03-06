const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

/* 
   DASHBOARD
 */
router.get(
  '/dashboard-stats',
  verifyToken,
  authorizeRoles('admin'),
  adminController.getDashboardStats
);

/* 
   DOCTOR MANAGEMENT
 */
router.post(
  '/doctors',
  verifyToken,
  authorizeRoles('admin'),
  adminController.addDoctor
);

router.get(
  '/doctors',
  verifyToken,
  authorizeRoles('admin'),
  adminController.getAllDoctors
);

router.delete(
  '/doctors/:doctorId',
  verifyToken,
  authorizeRoles('admin'),
  adminController.removeDoctor
);

module.exports = router;
