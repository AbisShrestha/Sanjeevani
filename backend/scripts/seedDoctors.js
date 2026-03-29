const { pool } = require('../src/models/doctorModel');

const doctorsToSeed = [
    {
        name: "Dr. Samjhana G.C.",
        specialty: "Women's Health",
        qualification: "BAMS, MD (Ayurveda)",
        experience: "12 years",
        hospital: "Patan Ayurvedic Hospital",
        phone: "9841000001",
        bio: "Specializing in women's reproductive health, menstrual disorders, and prenatal/postnatal Ayurvedic care."
    },
    {
        name: "Dr. Nipun Maharjan",
        specialty: "Bones & Joints",
        qualification: "BAMS, MS (Ayurveda Orthopedics)",
        experience: "15 years",
        hospital: "Sanjeevani Ortho Care",
        phone: "9841000002",
        bio: "Expert in treating arthritis, joint pain, and structural disorders using traditional Ayurvedic therapies and Panchakarma modalities."
    },
    {
        name: "Dr. Aanchal Shrestha",
        specialty: "Skin Specialist",
        qualification: "BAMS, Diploma in Ayurvedic Dermatology",
        experience: "8 years",
        hospital: "Glow Ayurveda Clinic",
        phone: "9841000003",
        bio: "Focused on treating chronic skin conditions like eczema, psoriasis, and acne using herbal formulations and holistic detox methods."
    },
    {
        name: "Dr. Bikram Malego",
        specialty: "Digestive",
        qualification: "BAMS, MD",
        experience: "10 years",
        hospital: "Gut Health Center",
        phone: "9841000004",
        bio: "Specializes in gastrointestinal disorders, IBS, hyperacidity, and metabolic resets through precise dietary and herbal interventions."
    },
    {
        name: "Dr. Naina Maharjan",
        specialty: "General",
        qualification: "BAMS",
        experience: "5 years",
        hospital: "Kathmandu Wellness Clinic",
        phone: "9841000005",
        bio: "General Ayurvedic physician focused on preventive care, immunity boosting, and holistic lifestyle management."
    },
    {
        name: "Dr. Kresica Ghising",
        specialty: "Panchakarma",
        qualification: "BAMS, MD (Panchakarma)",
        experience: "14 years",
        hospital: "Himalayan Detox Center",
        phone: "9841000006",
        bio: "Senior Panchakarma specialist leading intensive detoxification therapies and chronic disease management."
    },
    {
        name: "Dr. Nabin Shakya",
        specialty: "General",
        qualification: "BAMS",
        experience: "7 years",
        hospital: "City Ayurveda Hub",
        phone: "9841000007",
        bio: "Dedicated to treating common ailments, seasonal allergies, and providing comprehensive family dosha balancing."
    },
    {
        name: "Dr. Sumitra Rana",
        specialty: "Skin Specialist",
        qualification: "BAMS, MD",
        experience: "11 years",
        hospital: "Natural Aesthetics Clinic",
        phone: "9841000008",
        bio: "Combines modern dermatology understanding with ancient Ayurvedic herbology for radiant skin and hair care."
    },
    {
        name: "Dr. Alisha Joshi",
        specialty: "Women's Health",
        qualification: "BAMS",
        experience: "9 years",
        hospital: "Devi Care Center",
        phone: "9841000009",
        bio: "Passionate about empowering women through all stages of life, addressing hormonal imbalances and PCOS naturally."
    },
    {
        name: "Dr. Rojina Poudel",
        specialty: "Digestive",
        qualification: "BAMS, MD (Internal Medicine)",
        experience: "16 years",
        hospital: "Poudel Wellness",
        phone: "9841000010",
        bio: "Expert in deep digestive healing, treating ulcerative colitis, chronic gastritis, and gut-brain axis disturbances."
    }
];

const seedDoctors = async () => {
    try {
        console.log("Seeding Doctors...");
        
        for (const doc of doctorsToSeed) {
            const query = `
                INSERT INTO doctors (name, specialty, qualification, experience, hospital, phone, bio)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const values = [doc.name, doc.specialty, doc.qualification, doc.experience, doc.hospital, doc.phone, doc.bio];
            await pool.query(query, values);
            console.log(`Inserted: ${doc.name} - ${doc.specialty}`);
        }
        
        console.log("Finished seeding doctors.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding doctors:", err);
        process.exit(1);
    }
};

seedDoctors();
