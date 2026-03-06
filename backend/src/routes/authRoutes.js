const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers); // Admin: fetch all
router.delete('/users/:id', authController.deleteUser); // Admin: ban user (legacy)
router.put('/users/:id/role', authController.updateUserRole); // Admin: change role
router.put('/users/:id/status', authController.updateUserStatus); // Admin: toggle status

module.exports = router;
