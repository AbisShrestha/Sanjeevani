const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/* 
   VALIDATION HELPERS
*/
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidFullName = (name) =>
  /^[A-Za-z ]+$/.test(name.trim());

const isValidPhone = (phone) =>
  /^[0-9]{10}$/.test(phone);

const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_]).{8,}$/.test(password);

/* 
   REGISTER
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (!isValidFullName(fullName)) {
      return res.status(400).json({
        message: 'Full name must contain only letters and spaces',
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        message: 'Phone number must be exactly 10 digits',
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must include uppercase, lowercase, number, and special character',
      });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      fullName,
      email,
      passwordHash,
      phone,
      role: 'user',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: newUser.userid,
        fullName: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/*
   LOGIN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userid,
        fullName: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

/*
   GET ALL USERS (ADMIN ONLY)
 */
const getAllUsers = async (req, res) => {
  try {
    // In a real app, check if req.user.role === 'admin' here
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/*
   DELETE USER (ADMIN ONLY)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // We can use updateUserStatus to soft delete, or add a hard delete method
    // For now, let's assume hard delete or status update based on requirement.
    // I will use updateUserStatus for now to just deactivate them.
    await userModel.updateUserStatus(id, false);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/*
   UPDATE USER ROLE (ADMIN ONLY)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await userModel.updateUserRole(id, role);
    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

/*
   UPDATE USER STATUS (ADMIN ONLY)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    await userModel.updateUserStatus(id, isActive);
    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
};

module.exports = { register, login, getAllUsers, deleteUser, updateUserRole, updateUserStatus };
