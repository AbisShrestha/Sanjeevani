const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const profileUpload = require('../middlewares/profileUploadMiddleware');
const { getProfile, updateProfileImage } = require('../models/userModel');

// GET /api/profile - Get current user's profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const profile = await getProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// POST /api/profile/image - Upload profile image
router.post('/image', verifyToken, profileUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const userId = req.user.userId;
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        const updatedUser = await updateProfileImage(userId, imageUrl);

        res.json({
            message: 'Profile image updated successfully',
            profileimage: imageUrl,
            user: updatedUser,
        });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ message: 'Failed to upload profile image' });
    }
});

module.exports = router;
