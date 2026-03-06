const pool = require('../config/db');

// Link to the shared pool directly

const createDoctorTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS doctors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            specialty VARCHAR(255) NOT NULL,
            qualification VARCHAR(255),
            experience VARCHAR(100),
            hospital VARCHAR(255),
            phone VARCHAR(50),
            bio TEXT,
            rating NUMERIC(2, 1) DEFAULT 5.0,
            image TEXT,
            is_available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("Doctors table created successfully.");

        // Schema Migration: Ensure new columns exist for existing tables
        const alterQueries = [
            `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hospital VARCHAR(255);`,
            `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`,
            `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio TEXT;`,
            `ALTER TABLE doctors ALTER COLUMN qualification DROP NOT NULL;` // Frontend might not send qualification
        ];

        for (const q of alterQueries) {
            await pool.query(q);
        }

    } catch (err) {
        console.error("Error creating/updating doctors table:", err);
    }
};

module.exports = { pool, createDoctorTable };
