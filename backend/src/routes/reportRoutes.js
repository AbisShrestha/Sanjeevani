const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const reportUpload = require('../middlewares/reportUploadMiddleware');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * Medical Report Routes
 * Mounted at /api/reports
 */

// User uploads a medical report
router.post('/upload', verifyToken, reportUpload.single('file'), reportController.uploadReport);

// User views their own reports
router.get('/my-reports', verifyToken, reportController.getMyReports);

// User deletes their own report
router.delete('/:id', verifyToken, reportController.deleteReport);

// Doctor views a patient's reports
router.get('/patient/:patientId', verifyToken, authorizeRoles('doctor'), reportController.getPatientReports);

module.exports = router;
