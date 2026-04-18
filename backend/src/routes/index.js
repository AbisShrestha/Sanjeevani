const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const medicineRoutes = require('./medicineRoutes');
const categoryRoutes = require('./categoryRoutes');
const chatRoutes = require('./chatRoutes');
const esewaRoutes = require('./esewaRoutes');
const orderRoutes = require('./orderRoutes');
const doctorRoutes = require('./doctorRoutes');
const doctorFeaturesRoutes = require('./doctorFeaturesRoutes');
const reportRoutes = require('./reportRoutes');
let profileRoutes;
try {
  profileRoutes = require('./profileRoutes');
  console.log('[Routes] profileRoutes loaded successfully');
} catch (err) {
  console.error('[Routes] FAILED to load profileRoutes:', err.message);
  profileRoutes = express.Router(); // fallback empty router
}

/* 
   API ROUTES
*/
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/medicines', medicineRoutes);
router.use('/categories', categoryRoutes);
router.use('/chat', chatRoutes);
router.use('/esewa', esewaRoutes);
router.use('/orders', orderRoutes);
router.use('/doctors', doctorRoutes);
router.use('/doctor-features', doctorFeaturesRoutes);
router.use('/profile', profileRoutes);
router.use('/reports', reportRoutes);

/* 
   API HEALTH CHECK
*/
router.get('/', (req, res) => {
   res.json({ message: 'Sanjeevani API is running...' });
});

/* 
   404 FALLBACK for /api
*/
router.use((req, res) => {
   res.status(404).json({ 
      success: false, 
      message: `API Route Not Found: ${req.method} ${req.originalUrl}` 
   });
});

module.exports = router;
