const userModel = require('../models/userModel');
const pool = require('../config/db'); // Use shared pool

// ADD DOCTOR (Admin only)
const addDoctor = async (req, res) => {
    try {
        // Frontend sends: name, specialty, experience, hospital, phone, bio, image
        // We default qualification if missing, as frontend doesn't seem to send it currently
        const { name, specialty, qualification, experience, hospital, phone, bio, image } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({ error: "Name must be at least 3 characters" });
        }
        if (!specialty) {
            return res.status(400).json({ error: "Specialty is required" });
        }
        // Image validation is good but strict. Frontend handles upload before calling this.

        const query = `
            INSERT INTO doctors (name, specialty, qualification, experience, hospital, phone, bio, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [
            name,
            specialty,
            qualification || 'MD (Ayurveda)', // Default if missing
            experience,
            hospital,
            phone,
            bio,
            image
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ message: "Doctor added successfully", doctor: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

// DELETE DOCTOR (Admin only)
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        if (typeof id === 'string' && id.startsWith('u-')) {
            return res.status(400).json({ error: "Cannot delete registered users here. Go to Manage Users to delete this account." });
        }

        await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
        res.json({ message: "Doctor deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

// GET ALL DOCTORS (Public)
// Only serves from the dedicated 'doctors' table where profiles are properly curated
const getAllDoctors = async (req, res) => {
    try {
        let allDoctors;
        const { search } = req.query;

        if (search) {
            const queryRaw = `%${search.trim()}%`;
            const result = await pool.query(
                `SELECT * FROM doctors 
                 WHERE name ILIKE $1 OR specialty ILIKE $1 OR hospital ILIKE $1
                 ORDER BY name ASC`,
                [queryRaw]
            );
            allDoctors = result.rows;
        } else {
            const result = await pool.query('SELECT * FROM doctors ORDER BY name ASC');
            allDoctors = result.rows;
        }

        res.json(allDoctors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

// UPDATE DOCTOR (Admin only)
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialty, qualification, experience, hospital, phone, bio, image } = req.body;

        if (typeof id === 'string' && id.startsWith('u-')) {
            // "Promote" the User-Doctor into the official doctors table with rich data
            const insertQuery = `
                INSERT INTO doctors (name, specialty, qualification, experience, hospital, phone, bio, image)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;
            `;
            const insertValues = [
                name, specialty, qualification || 'MD (Ayurveda)', experience, hospital, phone, bio, image
            ];
            const insertResult = await pool.query(insertQuery, insertValues);
            return res.status(201).json({ message: "User-Doctor promoted to official listing!", doctor: insertResult.rows[0] });
        }

        const query = `
            UPDATE doctors
            SET name = $1, specialty = $2, qualification = $3, experience = $4, hospital = $5, phone = $6, bio = $7, image = $8
            WHERE id = $9
            RETURNING *;
        `;
        const values = [
            name,
            specialty,
            qualification || 'MD (Ayurveda)',
            experience,
            hospital,
            phone,
            bio,
            image,
            id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        res.json({ message: "Doctor updated successfully", doctor: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

module.exports = { addDoctor, getAllDoctors, deleteDoctor, updateDoctor };


