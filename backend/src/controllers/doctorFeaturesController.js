const pool = require('../config/db');

/* 
  ==================
  INSIGHTS -> mapped to `articles`
  title, content, imageurl, authorid
  ==================
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

/* 
  ==================
  APPOINTMENTS -> mapped to `consultations`
  userid, doctorid, scheduledat, meetinglink, status
  ==================
*/
const createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, reason } = req.body;
        const patientId = req.user.userId;

        if (!doctorId || !appointmentDate) {
            return res.status(400).json({ message: 'Doctor and date are required' });
        }

        const timestamp = Date.now();

        let finalDoctorId = doctorId;
        if (typeof doctorId === 'string' && doctorId.startsWith('u-')) {
            finalDoctorId = parseInt(doctorId.replace('u-', ''), 10);
        } else {
            // Must be a registered user to book a video consultation
            finalDoctorId = parseInt(doctorId, 10);
        }

        const jitsiLink = `https://meet.jit.si/Sanjeevani-${finalDoctorId}-${patientId}-${timestamp}`;

        const query = `
            INSERT INTO consultations (userid, doctorid, scheduledat, meetinglink)
            VALUES ($1, $2, $3, $4)
            RETURNING consultationid as id, *, scheduledat as appointment_date, meetinglink as jitsi_link;
        `;
        // 'reason' is not supported in the consultations table natively, but can be added to notes or dropped. 
        // For zero-schema changes, we will simply drop 'reason' and rely on the date.
        const result = await pool.query(query, [patientId, finalDoctorId, appointmentDate, jitsiLink]);

        res.status(201).json({ message: 'Appointment booked successfully', appointment: result.rows[0] });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Failed to book appointment' });
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
        const { status } = req.body;
        const doctorId = req.user.userId;

        if (!['scheduled', 'completed', 'cancelled', 'pending', 'confirmed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Map frontend statuses to backend native 'scheduled' / 'completed' / 'cancelled' if possible
        let safeStatus = status;
        if (status === 'confirmed') safeStatus = 'scheduled';
        if (status === 'pending') safeStatus = 'scheduled'; // Since it drops in as scheduled natively

        const query = `
            UPDATE consultations
            SET status = $1
            WHERE consultationid = $2 AND doctorid = $3
            RETURNING consultationid as id, status;
        `;
        const result = await pool.query(query, [safeStatus, appointmentId, doctorId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }

        res.json({ message: 'Appointment status updated', appointment: result.rows[0] });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: 'Failed to update appointment' });
    }
};

/* 
  ==================
  PATIENT RECORDS -> mapped to `userhealthinputs`
  userid, bmi, lifestylenotes. 
  Since doctor creates this for a patient, we store Diagnosis/Prescription inside lifestylenotes formatted.
  ==================
*/
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
    createInsight,
    getMyInsights,
    getAllInsights,
    deleteInsight,
    createAppointment,
    getMyAppointmentsAsDoctor,
    getMyAppointmentsAsPatient,
    updateAppointmentStatus,
    createPatientRecord,
    getMyRecordsAsPatient,
    getDoctorRecordsForPatient
};
