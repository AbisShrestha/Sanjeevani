const pool = require('../config/db');

/**
 * CREATE USER (REGISTER / ADMIN ADD)
 */
/**
 * CREATE USER TABLE
 */
const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      userId SERIAL PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(50) DEFAULT 'user',
      isActive BOOLEAN DEFAULT TRUE,
      profileimage VARCHAR(500),
      createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    // Add profileimage column if table already exists without it
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profileimage VARCHAR(500);`);
    console.log("Users table created successfully.");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

/**
 * CREATE USER (REGISTER / ADMIN ADD)
 */
const createUser = async (user) => {
  const {
    fullName,
    email,
    passwordHash,
    phone,
    role = 'user',
    isActive = true,
  } = user;

  const query = `
    INSERT INTO users (fullName, email, passwordHash, phone, role, isActive)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING userId, fullName, email, phone, role, isActive, createdat AS "createdAt"
  `;

  const values = [fullName, email, passwordHash, phone, role, isActive];
  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * FIND USER BY EMAIL (LOGIN)
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

/**
 * FIND USER BY ID
 */
const findUserById = async (userId) => {
  const query = `
    SELECT userId, fullName, email, phone, role, isActive, createdat AS "createdAt"
    FROM users
    WHERE userId = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

/**
 * GET ALL DOCTORS (ADMIN)
 * Supports: ?search=text
 */
const getAllDoctors = async (search = '') => {
  let query = `
    SELECT userId AS "userId", fullName AS "fullName", email, phone, isActive AS "isActive", createdat AS "createdAt", profileimage
    FROM users
    WHERE role = 'doctor'
  `;
  const values = [];

  if (search) {
    query += ` AND (fullName ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY createdat DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * GET ALL USERS (ADMIN)
 * Supports: ?search=text
 */
const getAllUsers = async (search = '') => {
  let query = `
    SELECT userid, fullname, email, phone, role, isactive, createdat, profileimage
    FROM users
  `;
  const values = [];

  if (search) {
    query += ` WHERE (fullName ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY createdat DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * UPDATE USER STATUS (SOFT DELETE / ACTIVATE)
 */
const updateUserStatus = async (userId, isActive) => {
  const query = `
    UPDATE users
    SET isActive = $1
    WHERE userId = $2
  `;
  const result = await pool.query(query, [isActive, userId]);
  return result.rowCount > 0;
};



/**
 * UPDATE USER ROLE (ADMIN ONLY)
 */
const updateUserRole = async (userId, role) => {
  const query = `
    UPDATE users
    SET role = $1
    WHERE userId = $2
  `;
  const result = await pool.query(query, [role, userId]);
  return result.rowCount > 0;
};

/**
 * UPDATE PROFILE IMAGE
 */
const updateProfileImage = async (userId, imageUrl) => {
  const query = `
    UPDATE users
    SET profileimage = $1
    WHERE userId = $2
    RETURNING userId, fullName, email, phone, role, profileimage
  `;
  const result = await pool.query(query, [imageUrl, userId]);
  return result.rows[0];
};

/**
 * UPDATE USER PROFILE (NAME/PHONE)
 */
const updateProfile = async (userId, fullName, phone) => {
  const query = `
    UPDATE users
    SET fullName = $1, phone = $2
    WHERE userId = $3
    RETURNING userId, fullName, email, phone, role, profileimage
  `;
  const result = await pool.query(query, [fullName, phone, userId]);
  return result.rows[0];
};

/**
 * GET USER PROFILE
 */
const getProfile = async (userId) => {
  const query = `
    SELECT userId, fullName, email, phone, role, isActive, profileimage, createdat AS "createdAt"
    FROM users
    WHERE userId = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllDoctors,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  createUserTable,
  updateProfileImage,
  getProfile,
  updateProfile,
};
