const bcrypt = require('bcrypt');
const pool = require('../config/db');
const userModel = require('../models/userModel');

/* 
   ADMIN – DASHBOARD STATS
 */
const getDashboardStats = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD =
      Number(process.env.LOW_STOCK_THRESHOLD) || 10;

    const totalUsersResult = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const totalDoctorsResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'doctor'"
    );

    const totalMedicinesResult = await pool.query(
      'SELECT COUNT(*) FROM medicines'
    );

    const lowStockResult = await pool.query(
      'SELECT COUNT(*) FROM medicines WHERE stock <= $1',
      [LOW_STOCK_THRESHOLD]
    );

    res.json({
      totalUsers: Number(totalUsersResult.rows[0].count),
      totalDoctors: Number(totalDoctorsResult.rows[0].count),
      totalMedicines: Number(totalMedicinesResult.rows[0].count),
      lowStock: Number(lowStockResult.rows[0].count),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Failed to load dashboard statistics',
    });
  }
};

/* 
   ADMIN – ADD DOCTOR
 */
const addDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Full name, email and password are required',
      });
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const doctor = await userModel.createUser({
      fullName,
      email,
      passwordHash,
      phone: phone || null,
      role: 'doctor',
      isActive: true,
    });

    res.status(201).json({
      message: 'Doctor added successfully',
      doctor,
    });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({
      message: 'Failed to add doctor',
    });
  }
};

/* 
   ADMIN – DEACTIVATE DOCTOR (SOFT DELETE)
 */
const removeDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (isNaN(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    const doctor = await userModel.findUserById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor not found',
      });
    }

    await userModel.updateUserStatus(doctorId, false);

    res.json({
      message: 'Doctor access removed successfully',
    });
  } catch (error) {
    console.error('Remove doctor error:', error);
    res.status(500).json({
      message: 'Failed to remove doctor',
    });
  }
};

/* 
   ADMIN – GET ALL DOCTORS
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await userModel.getAllDoctors();
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
    });
  }
};

module.exports = {
  getDashboardStats,
  addDoctor,
  removeDoctor,
  getAllDoctors,
};
