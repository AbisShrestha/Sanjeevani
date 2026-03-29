const express = require('express');
const router = express.Router();
const doctorFeaturesController = require('../controllers/doctorFeaturesController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// ==============================
// PUBLIC / GENERAL USER ROUTES
// ==============================

// View all insights (Blogs) across all doctors
router.get('/insights/all', doctorFeaturesController.getAllInsights);

// View user's own appointments
router.get('/appointments/me', verifyToken, doctorFeaturesController.getMyAppointmentsAsPatient);

// View user's own health records
router.get('/records/me', verifyToken, doctorFeaturesController.getMyRecordsAsPatient);

// User checks if appointment is available before paying
router.post('/appointments/check', verifyToken, doctorFeaturesController.checkAppointmentAvailability);

// User books an appointment with a doctor
router.post('/appointments', verifyToken, doctorFeaturesController.createAppointment);

// ==============================
// ADMIN ROUTES
// ==============================
router.put('/insights/:id', verifyToken, authorizeRoles('admin'), doctorFeaturesController.adminUpdateInsight);
router.delete('/insights/admin/:id', verifyToken, authorizeRoles('admin'), doctorFeaturesController.adminDeleteInsight);

// ==============================
// DOCTOR ONLY ROUTES
// ==============================

// Insights (Doctor Blogs/Articles)
router.post('/insights', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.createInsight);
router.get('/insights/me', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.getMyInsights);
router.delete('/insights/:id', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.deleteInsight);

// Appointments (Doctor managing their bookings)
router.get('/appointments/doctor', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.getMyAppointmentsAsDoctor);
router.put('/appointments/:id/status', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.updateAppointmentStatus);

// Patient Records (Doctor submitting health records)
router.post('/records', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.createPatientRecord);
router.get('/records/patient/:patientId', verifyToken, authorizeRoles('doctor'), doctorFeaturesController.getDoctorRecordsForPatient);

module.exports = router;
