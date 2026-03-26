const reportModel = require('../models/reportModel');
const path = require('path');
const fs = require('fs');

const MAX_TOTAL_STORAGE = 100 * 1024 * 1024; // 100MB per user

/**
 * POST /api/reports/upload
 * Upload a medical report (PDF or image)
 */
const uploadReport = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Check total storage used
    const currentUsage = await reportModel.getUserStorageUsed(userId);
    if (currentUsage + req.file.size > MAX_TOTAL_STORAGE) {
      // Delete the already-saved file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Storage limit exceeded. You can upload up to 100MB total.',
        currentUsageMB: (currentUsage / (1024 * 1024)).toFixed(1),
      });
    }

    const report = await reportModel.addReport(
      userId,
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype
    );

    res.status(201).json(report);
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ error: 'Failed to upload report' });
  }
};

/**
 * GET /api/reports/my-reports
 * Get all reports for the logged-in user
 */
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reports = await reportModel.getUserReports(userId);
    const totalUsed = await reportModel.getUserStorageUsed(userId);

    res.json({
      reports,
      storageUsedBytes: totalUsed,
      storageLimitBytes: MAX_TOTAL_STORAGE,
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

/**
 * DELETE /api/reports/:id
 * Delete a report owned by the logged-in user
 */
const deleteReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reportId = req.params.id;

    const deleted = await reportModel.deleteReport(reportId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete file from disk
    const filePath = path.join('uploads', 'reports', deleted.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

/**
 * GET /api/reports/patient/:patientId
 * Doctor fetches a patient's medical reports
 */
const getPatientReports = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const reports = await reportModel.getUserReports(patientId);
    res.json(reports);
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ error: 'Failed to fetch patient reports' });
  }
};

module.exports = {
  uploadReport,
  getMyReports,
  deleteReport,
  getPatientReports,
};
