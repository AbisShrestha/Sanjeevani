const pool = require('../config/db');

/* 
  
  INSIGHTS -> mapped to `articles`
  title, content, imageurl, authorid
  
*/
const createInsight = async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;
        const doctorId = req.user.userId;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const query = `
            INSERT INTO articles (title, content, imageurl, authorid)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(query, [title, content, imageUrl || '', doctorId]);

        // Return mapped to match frontend expectations
        const mapped = {
            id: result.rows[0].articleid,
            ...result.rows[0],
            image_url: result.rows[0].imageurl,
            created_at: result.rows[0].createdat
        };

        res.status(201).json({ message: 'Insight created successfully', insight: mapped });
    } catch (error) {
        console.error('Create insight error:', error);
        res.status(500).json({ message: 'Failed to create insight' });
    }
};

const getMyInsights = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const query = `
            SELECT articleid as id, title, content, imageurl as image_url, createdat as created_at 
            FROM articles
            WHERE authorid = $1
            ORDER BY createdat DESC;
        `;
        const result = await pool.query(query, [doctorId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ message: 'Failed to fetch insights' });
    }
};

const getAllInsights = async (req, res) => {
    try {
        const query = `
            SELECT a.articleid as id, a.title, a.content, a.imageurl as image_url, a.createdat as created_at, u.fullName as doctor_name 
            FROM articles a
            JOIN users u ON a.authorid = u.userId
            ORDER BY a.createdat DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all insights error:', error);
        res.status(500).json({ message: 'Failed to fetch all insights' });
    }
};

const deleteInsight = async (req, res) => {
    try {
        const insightId = req.params.id;
        const doctorId = req.user.userId;

        const query = `
            DELETE FROM articles
            WHERE articleid = $1 AND authorid = $2
            RETURNING articleid as id;
        `;
        const result = await pool.query(query, [insightId, doctorId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Insight not found or unauthorized' });
        }

        res.json({ message: 'Insight deleted successfully', insight: result.rows[0] });
    } catch (error) {
        console.error('Delete insight error:', error);
        res.status(500).json({ message: 'Failed to delete insight' });
    }
};

// ADMIN: Delete any insight regardless of author
const adminDeleteInsight = async (req, res) => {
    try {
        const insightId = req.params.id;
        const query = `DELETE FROM articles WHERE articleid = $1 RETURNING articleid as id;`;
        const result = await pool.query(query, [insightId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json({ message: 'Insight deleted successfully' });
    } catch (error) {
        console.error('Admin delete insight error:', error);
        res.status(500).json({ message: 'Failed to delete insight' });
    }
};

// ADMIN: Update any insight
const adminUpdateInsight = async (req, res) => {
    try {
        const insightId = req.params.id;
        const { title, content, imageUrl } = req.body;

        const query = `
            UPDATE articles
            SET title = COALESCE($1, title), content = COALESCE($2, content), imageurl = COALESCE($3, imageurl)
            WHERE articleid = $4
            RETURNING articleid as id, title, content, imageurl as image_url, createdat as created_at;
        `;
        const result = await pool.query(query, [title, content, imageUrl, insightId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json({ message: 'Insight updated successfully', insight: result.rows[0] });
    } catch (error) {
        console.error('Admin update insight error:', error);
        res.status(500).json({ message: 'Failed to update insight' });
    }
};

// Appointment management

const resolveDoctorUserId = async (doctorId) => {
    if (typeof doctorId === 'string' && doctorId.startsWith('u-')) {
        return parseInt(doctorId.replace('u-', ''), 10);
    }
    
    const numericId = parseInt(doctorId, 10);
    
    // Attempt 1: Check if this numeric ID exists in doctors table, then map by name to users table
    const doctorProfile = await pool.query('SELECT name FROM doctors WHERE id = $1', [numericId]);
    
    if (doctorProfile.rows.length > 0) {
        // Try mapping by name
        const doctorName = doctorProfile.rows[0].name;
        const userMatch = await pool.query("SELECT userId FROM users WHERE fullName = $1 AND role = 'doctor'", [doctorName]);
        if (userMatch.rows.length > 0) {
            return userMatch.rows[0].userid;
        }
    }
    
    // Attempt 2: Maybe they passed the actual userId from the users table by mistake?
    const userCheck = await pool.query("SELECT userId FROM users WHERE userId = $1 AND role = 'doctor'", [numericId]);
    if (userCheck.rows.length > 0) {
        return userCheck.rows[0].userid;
    }
    
    return null;
};

const checkAppointmentAvailability = async (req, res) => {
    try {
        const { doctorId, appointmentDate } = req.body;
        
        if (!doctorId || !appointmentDate) {
            return res.status(400).json({ message: 'Doctor ID and Date are required' });
        }

        const finalDoctorId = await resolveDoctorUserId(doctorId);
        if (!finalDoctorId) {
            return res.status(404).json({ message: 'Doctor user account not found.' });
        }

        const checkQuery = `
            SELECT consultationid FROM consultations 
            WHERE doctorid = $1 
            AND scheduledat = $2 
            AND status != 'cancelled'
        `;
        const checkResult = await pool.query(checkQuery, [finalDoctorId, appointmentDate]);
        
        if (checkResult.rows.length > 0) {
            return res.status(409).json({ available: false, message: 'This time slot is already booked.' });
        }
        res.json({ available: true });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ message: 'Failed to verify slot availability' });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, reason } = req.body;
        const patientId = req.user.userId;

        if (!doctorId || !appointmentDate) {
            return res.status(400).json({ message: 'Doctor and date are required' });
        }

        const timestamp = Date.now();

        const finalDoctorId = await resolveDoctorUserId(doctorId);
        if (!finalDoctorId) {
            return res.status(404).json({ message: 'Doctor user account not found.' });
        }

        // 
        // 1. Double-Booking Validation
        // 
        const checkQuery = `
            SELECT consultationid FROM consultations 
            WHERE doctorid = $1 
            AND scheduledat = $2 
            AND status != 'cancelled'
        `;
        const checkResult = await pool.query(checkQuery, [finalDoctorId, appointmentDate]);
        
        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: 'This time slot is already booked. Please select another time.' });
        }

        const jitsiLink = `https://meet.jit.si/Sanjeevani-${finalDoctorId}-${patientId}-${timestamp}`;

        const query = `
            INSERT INTO consultations (userid, doctorid, scheduledat, meetinglink)
            VALUES ($1, $2, $3, $4)
            RETURNING consultationid as id, *, scheduledat as appointment_date, meetinglink as jitsi_link;
        `;
        const result = await pool.query(query, [patientId, finalDoctorId, appointmentDate, jitsiLink]);

        res.status(201).json({ message: 'Appointment booked successfully', appointment: result.rows[0] });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Failed to book appointment', error: error.message, stack: error.stack });
    }
};

const getMyAppointmentsAsDoctor = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const query = `
            SELECT c.consultationid as id, c.userid as patient_id, c.scheduledat as appointment_date, c.status, c.meetinglink as jitsi_link, u.fullName as patient_name, u.email as patient_email
            FROM consultations c
            JOIN users u ON c.userid = u.userId
            WHERE c.doctorid = $1
            ORDER BY c.scheduledat ASC;
        `;
        const result = await pool.query(query, [doctorId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

const getMyAppointmentsAsPatient = async (req, res) => {
    try {
        const patientId = req.user.userId;
        const query = `
            SELECT c.consultationid as id, c.scheduledat as appointment_date, c.status, c.meetinglink as jitsi_link, u.fullName as doctor_name
            FROM consultations c
            JOIN users u ON c.doctorid = u.userId
            WHERE c.userid = $1
            ORDER BY c.scheduledat ASC;
        `;
        const result = await pool.query(query, [patientId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({ message: 'Failed to fetch appointments' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status, appointmentDate } = req.body;
        const doctorId = req.user.userId;

        if (!['scheduled', 'completed', 'cancelled', 'pending', 'confirmed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Map frontend statuses to backend native 'scheduled' / 'completed' / 'cancelled' if possible
        let safeStatus = status;
        if (status === 'confirmed') safeStatus = 'scheduled';
        if (status === 'pending') safeStatus = 'scheduled'; // Since it drops in as scheduled natively

        let query = `
            UPDATE consultations
            SET status = $1
            WHERE consultationid = $2 AND doctorid = $3
            RETURNING consultationid as id, status;
        `;
        let params = [safeStatus, appointmentId, doctorId];

        // If a new date is provided, update that too (for rescheduling)
        if (appointmentDate) {
            query = `
                UPDATE consultations
                SET status = $1, scheduledat = $4
                WHERE consultationid = $2 AND doctorid = $3
                RETURNING consultationid as id, status, scheduledat as appointment_date;
            `;
            params = [safeStatus, appointmentId, doctorId, appointmentDate];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }

        res.json({ message: 'Appointment status updated', appointment: result.rows[0] });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: 'Failed to update appointment' });
    }
};

// Patient records management
const createPatientRecord = async (req, res) => {
    try {
        const { patientId, diagnosis, prescription, notes } = req.body;
        const doctorId = req.user.userId;

        if (!patientId || !diagnosis) {
            return res.status(400).json({ message: 'Patient ID and diagnosis are required' });
        }

        const combinedNotes = `[DOCTOR RECORD: ${doctorId}]\nDiagnosis: ${diagnosis}\nPrescription: ${prescription || 'N/A'}\nNotes: ${notes || 'N/A'}`;

        const query = `
            INSERT INTO userhealthinputs (userid, lifestylenotes)
            VALUES ($1, $2)
            RETURNING inputid as id, lifestylenotes, createdat as created_at;
        `;
        const result = await pool.query(query, [patientId, combinedNotes]);

        // Map it back for frontend
        const record = result.rows[0];
        res.status(201).json({
            message: 'Patient record created successfully', record: {
                id: record.id,
                diagnosis: diagnosis,
                prescription: prescription,
                notes: notes,
                created_at: record.created_at
            }
        });
    } catch (error) {
        console.error('Create patient record error:', error);
        res.status(500).json({ message: 'Failed to create patient record' });
    }
};

const getMyRecordsAsPatient = async (req, res) => {
    try {
        const patientId = req.user.userId;
        const query = `
            SELECT inputid as id, lifestylenotes, createdat as created_at
            FROM userhealthinputs
            WHERE userid = $1 AND lifestylenotes LIKE '[DOCTOR RECORD:%'
            ORDER BY createdat DESC;
        `;
        const result = await pool.query(query, [patientId]);

        // Parse the parsed notes back out into objects
        const parsed = result.rows.map(row => {
            const matches = row.lifestylenotes.match(/Diagnosis: (.*)\nPrescription: (.*)\nNotes: (.*)/s);
            return {
                id: row.id,
                created_at: row.created_at,
                diagnosis: matches ? matches[1] : 'Extracted Record',
                prescription: matches ? matches[2] : '',
                notes: matches ? matches[3] : ''
            }
        });

        res.json(parsed);
    } catch (error) {
        console.error('Get patient records error:', error);
        res.status(500).json({ message: 'Failed to fetch patient records' });
    }
};

const getDoctorRecordsForPatient = async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const patientId = req.params.patientId;
        const query = `
            SELECT inputid as id, lifestylenotes, createdat as created_at
            FROM userhealthinputs
            WHERE userid = $1 AND lifestylenotes LIKE $2
            ORDER BY createdat DESC;
        `;
        const result = await pool.query(query, [patientId, `[DOCTOR RECORD: ${doctorId}]%`]);

        const parsed = result.rows.map(row => {
            const matches = row.lifestylenotes.match(/Diagnosis: (.*)\nPrescription: (.*)\nNotes: (.*)/s);
            return {
                id: row.id,
                created_at: row.created_at,
                diagnosis: matches ? matches[1] : 'Extracted Record',
                prescription: matches ? matches[2] : '',
                notes: matches ? matches[3] : ''
            }
        });

        res.json(parsed);
    } catch (error) {
        console.error('Get doctor patient records error:', error);
        res.status(500).json({ message: 'Failed to fetch patient records' });
    }
};

module.exports = {
    checkAppointmentAvailability,
    createInsight,
    getMyInsights,
    getAllInsights,
    deleteInsight,
    adminDeleteInsight,
    adminUpdateInsight,
    createAppointment,
    getMyAppointmentsAsDoctor,
    getMyAppointmentsAsPatient,
    updateAppointmentStatus,
    createPatientRecord,
    getMyRecordsAsPatient,
    getDoctorRecordsForPatient
};
