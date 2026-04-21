const pool = require('../config/db');

// Admin medicines management
// Table initialization
const createCategoryTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS categories (
        categoryid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  try {
    await pool.query(query);
    // Add UNIQUE constraint if table already existed without it
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);
      EXCEPTION WHEN duplicate_table OR duplicate_object THEN
        NULL;
      END $$;
    `);
    console.log("Categories table created successfully.");
  } catch (err) {
    console.error("Error creating categories table:", err);
  }
};

const createMedicineTable = async () => {
  const query = `
      CREATE TABLE IF NOT EXISTS medicines (
        medicineid SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        categoryid INTEGER REFERENCES categories(categoryid),
        description TEXT,
        dosage VARCHAR(255),
        benefits TEXT,
        usageinstructions TEXT,
        precautions TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        imageurl TEXT,
        lowstockthreshold INTEGER DEFAULT 10,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  try {
    await pool.query(query);
    console.log("Medicines table created successfully.");
  } catch (err) {
    console.error("Error creating medicines table:", err);
  }
};

// Add new medicine
const createMedicine = async (medicine) => {
  const {
    name,
    categoryId,
    description,
    dosage,
    benefits,
    usageInstructions,
    precautions,
    price,
    stock = 0,
    imageUrl,
    lowStockThreshold = 10,
  } = medicine;

  const query = `
    INSERT INTO medicines
    (
      name,
      categoryid,
      description,
      dosage,
      benefits,
      usageinstructions,
      precautions,
      price,
      stock,
      imageurl,
      lowstockthreshold
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `;

  const values = [
    name,
    categoryId,
    description,
    dosage,
    benefits,
    usageInstructions,
    precautions,
    price,
    stock,
    imageUrl,
    lowStockThreshold,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all medicines
const getAllMedicines = async () => {
  const query = `
    SELECT 
      m.medicineid,
      m.name,
      m.description,
      m.dosage,
      m.benefits,
      m.usageinstructions,
      m.precautions,
      m.price,
      m.stock,
      m.imageurl,
      m.lowstockthreshold,
      m.createdat,
      c.name AS categoryname
    FROM medicines m
    LEFT JOIN categories c ON m.categoryid = c.categoryid
    ORDER BY m.createdat DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Search medicines with filters
const searchMedicines = async ({ search, category, sortBy }) => {
  let query = `
    SELECT 
      m.medicineid,
      m.name,
      m.description,
      m.dosage,
      m.benefits,
      m.usageinstructions,
      m.precautions,
      m.price,
      m.stock,
      m.imageurl,
      m.lowstockthreshold,
      m.createdat,
      c.name AS categoryname
    FROM medicines m
    LEFT JOIN categories c ON m.categoryid = c.categoryid
    WHERE 1=1
  `;

  const values = [];
  let paramIndex = 1;

  // Text search on name and description
  if (search && search.trim()) {
    query += ` AND (m.name ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`;
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  // Category filter
  if (category && category.trim() && category.toLowerCase() !== 'all') {
    query += ` AND c.name ILIKE $${paramIndex}`;
    values.push(`%${category.trim()}%`);
    paramIndex++;
  }

  // Sort by price
  if (sortBy === 'lowHigh') {
    query += ` ORDER BY m.price ASC`;
  } else if (sortBy === 'highLow') {
    query += ` ORDER BY m.price DESC`;
  } else {
    query += ` ORDER BY m.createdat DESC`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

// Get medicine by ID
const getMedicineById = async (medicineId) => {
  const query = `
    SELECT 
      m.*,
      c.name AS categoryname
    FROM medicines m
    LEFT JOIN categories c ON m.categoryid = c.categoryid
    WHERE m.medicineid = $1
  `;

  const result = await pool.query(query, [medicineId]);
  return result.rows[0];
};

// Update medicine record
const updateMedicine = async (medicineId, data) => {
  const {
    name,
    categoryId,
    description,
    dosage,
    benefits,
    usageInstructions,
    precautions,
    price,
    stock,
    lowStockThreshold,
    imageUrl,
  } = data;

  const query = `
    UPDATE medicines
    SET
      name = $1,
      categoryid = $2,
      description = $3,
      dosage = $4,
      benefits = $5,
      usageinstructions = $6,
      precautions = $7,
      price = $8,
      stock = $9,
      lowstockthreshold = $10,
      imageurl = COALESCE($11, imageurl),
      updatedat = CURRENT_TIMESTAMP
    WHERE medicineid = $12
    RETURNING *
  `;

  const values = [
    name,
    categoryId,
    description,
    dosage,
    benefits,
    usageInstructions,
    precautions,
    price,
    stock,
    lowStockThreshold,
    imageUrl,
    medicineId,
  ];

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

// Update stock levels
const updateStock = async (medicineId, stock) => {
  const query = `
    UPDATE medicines
    SET
      stock = $1,
      updatedat = CURRENT_TIMESTAMP
    WHERE medicineid = $2
    RETURNING *
  `;

  const result = await pool.query(query, [stock, medicineId]);
  return result.rowCount > 0;
};

// Permanent delete medicine record
const deleteMedicine = async (medicineId) => {
  const query = `
    DELETE FROM medicines
    WHERE medicineid = $1
    RETURNING medicineid
  `;

  const result = await pool.query(query, [medicineId]);
  return result.rowCount > 0;
};

// Low stock alerts
const getLowStockMedicines = async (search = '') => {
  let query = `
    SELECT 
      m.medicineid,
      m.name,
      m.description,
      m.dosage,
      m.benefits,
      m.usageinstructions,
      m.precautions,
      m.price,
      m.stock,
      m.imageurl,
      m.lowstockthreshold,
      m.createdat,
      c.name AS categoryname
    FROM medicines m
    LEFT JOIN categories c ON m.categoryid = c.categoryid
    WHERE m.stock <= COALESCE(m.lowstockthreshold, 10)
  `;

  const values = [];
  if (search) {
    query += ` AND (m.name ILIKE $1 OR c.name ILIKE $1)`;
    values.push(`%${search}%`);
  }

  query += ` ORDER BY m.stock ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = {
  createMedicine,
  getAllMedicines,
  searchMedicines,
  getMedicineById,
  updateMedicine,
  updateStock,
  deleteMedicine,
  getLowStockMedicines,
  createCategoryTable,
  createMedicineTable,
};
