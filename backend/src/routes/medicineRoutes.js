const express = require('express');
const router = express.Router();

const medicineController = require('../controllers/medicineController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Admin routes

router.post(
  '/',
  verifyToken,
  authorizeRoles('admin'),
  medicineController.addMedicine
);

router.put(
  '/:medicineId',
  verifyToken,
  authorizeRoles('admin'),
  medicineController.updateMedicine
);

router.put(
  '/:medicineId/stock',
  verifyToken,
  authorizeRoles('admin'),
  medicineController.updateStock
);

router.delete(
  '/:medicineId',
  verifyToken,
  authorizeRoles('admin'),
  medicineController.deleteMedicine
);

router.get(
  '/admin/low-stock',
  verifyToken,
  authorizeRoles('admin'),
  medicineController.getLowStockMedicines
);

// Public routes

router.get('/', medicineController.getMedicines);
router.get('/:medicineId', medicineController.getMedicine);

module.exports = router;
