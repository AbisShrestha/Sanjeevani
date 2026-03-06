const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const medicineRoutes = require('./medicineRoutes');
const categoryRoutes = require('./categoryRoutes');
const chatRoutes = require('./chatRoutes');
const doctorRoutes = require('./doctorRoutes');
const doctorFeaturesRoutes = require('./doctorFeaturesRoutes');

/* 
   API ROUTES
*/
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/medicines', medicineRoutes);
router.use('/categories', categoryRoutes);
router.use('/chat', chatRoutes); // [NEW]
router.use('/doctors', doctorRoutes);
router.use('/doctor-features', doctorFeaturesRoutes);

/* 
   API HEALTH CHECK
*/
router.get('/', (req, res) => {
   res.json({ message: 'Sanjeevani API is running...' });
});

module.exports = router;
