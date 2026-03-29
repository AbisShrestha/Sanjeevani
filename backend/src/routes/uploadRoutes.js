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
    // Reconstruct the correct path (req.file.destination is e.g. "uploads/doctors/")
    // We add a leading slash to make it /uploads/doctors/...
    const dir = req.file.destination.replace(/\/$/, ""); // remove trailing slash if any
    const fileUrl = `/${dir}/${req.file.filename}`;

    res.json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl
    });
});

module.exports = router;
