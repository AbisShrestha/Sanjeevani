/**
 * Sanjeevani - Register All 10 Doctors as Real Users + Enrich Doctor Table
 * 
 * This script does TWO things for each doctor:
 * 1. Creates a real user account (email + password) with role='doctor' in the users table
 * 2. Inserts the rich doctor profile (specialty, hospital, bio, etc.) into the doctors table
 * 
 * Run on GCP: sudo docker compose exec backend node scripts/seedDoctorUsers.js
 */

const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

const DOCTORS = [
    {
        fullName: 'Dr. Samjhana G.C.',
        email: 'samjhana@gmail.com',
        password: 'Samjhana@123',
        phone: '9841000001',
        specialty: "Women's Health",
        qualification: 'BAMS, MD (Ayurveda)',
        experience: '12 years',
        hospital: 'Patan Ayurvedic Hospital',
        bio: 'Specializing in women\'s reproductive health, menstrual disorders, and prenatal/postnatal Ayurvedic care.',
    },
    {
        fullName: 'Dr. Nipun Maharjan',
        email: 'nipun@gmail.com',
        password: 'Nipun@123',
        phone: '9841000002',
        specialty: 'Bones & Joints',
        qualification: 'BAMS, MS (Ayurveda Orthopedics)',
        experience: '15 years',
        hospital: 'Sanjeevani Ortho Care',
        bio: 'Expert in treating arthritis, joint pain, and structural disorders using traditional Ayurvedic therapies and Panchakarma modalities.',
    },
    {
        fullName: 'Dr. Aanchal Shrestha',
        email: 'aanchal@gmail.com',
        password: 'Aanchal@123',
        phone: '9841000003',
        specialty: 'Skin Specialist',
        qualification: 'BAMS, Diploma in Ayurvedic Dermatology',
        experience: '8 years',
        hospital: 'Glow Ayurveda Clinic',
        bio: 'Focused on treating chronic skin conditions like eczema, psoriasis, and acne using herbal formulations and holistic detox methods.',
    },
    {
        fullName: 'Dr. Bikram Malego',
        email: 'bikram@gmail.com',
        password: 'Bikram@123',
        phone: '9841000004',
        specialty: 'Digestive',
        qualification: 'BAMS, MD',
        experience: '10 years',
        hospital: 'Gut Health Center',
        bio: 'Specializes in gastrointestinal disorders, IBS, hyperacidity, and metabolic resets through precise dietary and herbal interventions.',
    },
    {
        fullName: 'Dr. Naina Maharjan',
        email: 'naina@gmail.com',
        password: 'Naina@123',
        phone: '9841000005',
        specialty: 'General',
        qualification: 'BAMS',
        experience: '5 years',
        hospital: 'Kathmandu Wellness Clinic',
        bio: 'General Ayurvedic physician focused on preventive care, immunity boosting, and holistic lifestyle management.',
    },
    {
        fullName: 'Dr. Kresica Ghising',
        email: 'kresica@gmail.com',
        password: 'Kresica@123',
        phone: '9841000006',
        specialty: 'Panchakarma',
        qualification: 'BAMS, MD (Panchakarma)',
        experience: '14 years',
        hospital: 'Himalayan Detox Center',
        bio: 'Senior Panchakarma specialist leading intensive detoxification therapies and chronic disease management.',
    },
    {
        fullName: 'Dr. Nabin Shakya',
        email: 'nabin@gmail.com',
        password: 'Nabin@123',
        phone: '9841000007',
        specialty: 'General',
        qualification: 'BAMS',
        experience: '7 years',
        hospital: 'City Ayurveda Hub',
        bio: 'Dedicated to treating common ailments, seasonal allergies, and providing comprehensive family dosha balancing.',
    },
    {
        fullName: 'Dr. Sumitra Rana',
        email: 'sumitra@gmail.com',
        password: 'Sumitra@123',
        phone: '9841000008',
        specialty: 'Skin Specialist',
        qualification: 'BAMS, MD',
        experience: '11 years',
        hospital: 'Natural Aesthetics Clinic',
        bio: 'Combines modern dermatology understanding with ancient Ayurvedic herbology for radiant skin and hair care.',
    },
    {
        fullName: 'Dr. Alisha Joshi',
        email: 'alisha@gmail.com',
        password: 'Alisha@123',
        phone: '9841000009',
        specialty: "Women's Health",
        qualification: 'BAMS',
        experience: '9 years',
        hospital: 'Devi Care Center',
        bio: 'Passionate about empowering women through all stages of life, addressing hormonal imbalances and PCOS naturally.',
    },
    {
        fullName: 'Dr. Rojina Poudel',
        email: 'rojina@gmail.com',
        password: 'Rojina@123',
        phone: '9841000010',
        specialty: 'Digestive',
        qualification: 'BAMS, MD (Internal Medicine)',
        experience: '16 years',
        hospital: 'Poudel Wellness',
        bio: 'Expert in deep digestive healing, treating ulcerative colitis, chronic gastritis, and gut-brain axis disturbances.',
    },
];

const seedDoctorUsers = async () => {
    console.log('===========================================');
    console.log('  SANJEEVANI - Register 10 Doctor Users');
    console.log('===========================================\n');

    let usersCreated = 0;
    let doctorsCreated = 0;
    let skipped = 0;

    for (const doc of DOCTORS) {
        try {
            // --- STEP 1: Create user account ---
            const existingUser = await pool.query(
                `SELECT userid FROM users WHERE LOWER(email) = LOWER($1)`,
                [doc.email]
            );

            let userId;
            if (existingUser.rows.length > 0) {
                userId = existingUser.rows[0].userid;
                console.log(`  SKIP  User ${doc.email} already exists (ID: ${userId})`);
            } else {
                const passwordHash = await bcrypt.hash(doc.password, 10);
                const userResult = await pool.query(
                    `INSERT INTO users (fullname, email, passwordhash, phone, role, isactive)
                     VALUES ($1, $2, $3, $4, 'doctor', true)
                     RETURNING userid`,
                    [doc.fullName, doc.email, passwordHash, doc.phone]
                );
                userId = userResult.rows[0].userid;
                usersCreated++;
                console.log(`  OK    User created: ${doc.email} / ${doc.password} (ID: ${userId})`);
            }

            // --- STEP 2: Create rich doctor profile ---
            const existingDoctor = await pool.query(
                `SELECT id FROM doctors WHERE LOWER(name) = LOWER($1)`,
                [doc.fullName]
            );

            if (existingDoctor.rows.length > 0) {
                console.log(`  SKIP  Doctor profile "${doc.fullName}" already exists`);
                skipped++;
                continue;
            }

            await pool.query(
                `INSERT INTO doctors (name, specialty, qualification, experience, hospital, phone, bio)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [doc.fullName, doc.specialty, doc.qualification, doc.experience, doc.hospital, doc.phone, doc.bio]
            );
            doctorsCreated++;
            console.log(`  OK    Doctor profile created: ${doc.fullName} - ${doc.specialty}`);

        } catch (err) {
            console.error(`  FAIL  ${doc.fullName}: ${err.message}`);
        }
    }

    console.log('\n--- Summary ---');
    console.log(`  User accounts created:  ${usersCreated}`);
    console.log(`  Doctor profiles created: ${doctorsCreated}`);
    console.log(`  Skipped (existing):      ${skipped}`);
    console.log('\n--- Login Credentials ---');
    for (const doc of DOCTORS) {
        console.log(`  ${doc.fullName.padEnd(25)} | ${doc.email.padEnd(22)} | ${doc.password}`);
    }
    console.log('');
    process.exit(0);
};

seedDoctorUsers();
