const app = require('./app');
require('dotenv').config();
const { createDoctorTable } = require('./models/doctorModel');
const { createUserTable } = require('./models/userModel');
const { createCategoryTable, createMedicineTable } = require('./models/medicineModel');

const PORT = process.env.PORT || 4000;

// Initialize Tables
createDoctorTable();
createUserTable();
createCategoryTable();
createMedicineTable();

// IMPORTANT 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
