const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT categoryid AS "categoryId", name FROM categories ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

module.exports = { getCategories };
