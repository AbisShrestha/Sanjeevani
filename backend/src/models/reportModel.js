const pool = require('../config/db');

/**
 * CREATE MEDICAL REPORTS TABLE
 */
const createReportsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS medical_reports (
      reportid SERIAL PRIMARY KEY,
      userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      originalname VARCHAR(255) NOT NULL,
      filesize INTEGER NOT NULL,
      mimetype VARCHAR(100) NOT NULL,
      uploadedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Medical reports table created successfully.');
  } catch (err) {
    console.error('Error creating medical_reports table:', err);
  }
};

/**
 * INSERT A NEW REPORT
 */
const addReport = async (userId, filename, originalname, filesize, mimetype) => {
  const query = `
    INSERT INTO medical_reports (userid, filename, originalname, filesize, mimetype)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const result = await pool.query(query, [userId, filename, originalname, filesize, mimetype]);
  return result.rows[0];
};

/**
 * GET REPORTS FOR A SPECIFIC USER
 */
const getUserReports = async (userId) => {
  const query = `
    SELECT * FROM medical_reports
    WHERE userid = $1
    ORDER BY uploadedat DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * GET TOTAL STORAGE USED BY A USER (in bytes)
 */
const getUserStorageUsed = async (userId) => {
  const query = `SELECT COALESCE(SUM(filesize), 0) as total FROM medical_reports WHERE userid = $1;`;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].total, 10);
};

/**
 * DELETE A REPORT
 */
const deleteReport = async (reportId, userId) => {
  const query = `DELETE FROM medical_reports WHERE reportid = $1 AND userid = $2 RETURNING *;`;
  const result = await pool.query(query, [reportId, userId]);
  return result.rows[0];
};

module.exports = {
  createReportsTable,
  addReport,
  getUserReports,
  getUserStorageUsed,
  deleteReport,
};
