const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the URL to access the file
    // Assuming server runs on the same host/port, client can prepend base URL
    // We return the relative path
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl
    });
});

module.exports = router;
