const pool = require('../src/config/db');

async function createMockAppointment() {
    try {
        // 1. Find a Doctor
        const doctorRes = await pool.query("SELECT userid, fullname FROM users WHERE role = 'doctor' LIMIT 1");
        // 2. Find a Patient
        const patientRes = await pool.query("SELECT userid, fullname FROM users WHERE role = 'user' LIMIT 1");

        if (doctorRes.rows.length === 0 || patientRes.rows.length === 0) {
            console.error("Could not find a doctor or patient in the database.");
            process.exit(1);
        }

        const doctor = doctorRes.rows[0];
        const patient = patientRes.rows[0];
        const timestamp = Date.now();
        const scheduledAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
        const jitsiLink = `https://meet.jit.si/Sanjeevani-${doctor.userid}-${patient.userid}-${timestamp}`;

        // 3. Insert Consultation
        const insertQuery = `
            INSERT INTO consultations (userid, doctorid, scheduledat, meetinglink, status)
            VALUES ($1, $2, $3, $4, 'scheduled')
            RETURNING consultationid;
        `;
        const result = await pool.query(insertQuery, [patient.userid, doctor.userid, scheduledAt, jitsiLink]);

        console.log("==========================================");
        console.log("✅ MOCK APPOINTMENT CREATED SUCCESSFULLY");
        console.log("==========================================");
        console.log(`Patient: ${patient.fullname} (ID: ${patient.userid})`);
        console.log(`Doctor:  ${doctor.fullname} (ID: ${doctor.userid})`);
        console.log(`Time:    ${scheduledAt}`);
        console.log(`Link:    ${jitsiLink}`);
        console.log("==========================================");

    } catch (err) {
        console.error("Error creating mock appointment:", err);
    } finally {
        pool.end();
    }
}

createMockAppointment();
