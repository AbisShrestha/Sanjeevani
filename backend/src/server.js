const app = require('./app');
require('dotenv').config();
const { createDoctorTable } = require('./models/doctorModel');
const { createUserTable } = require('./models/userModel');
const { createCategoryTable, createMedicineTable } = require('./models/medicineModel');
const { createOrderTable } = require('./models/orderModel');
const { createReportsTable } = require('./models/reportModel');

const PORT = process.env.PORT || 4000;

// Initialize Tables Sequentially
(async () => {
    try {
        await createDoctorTable();
        await createUserTable();
        await createCategoryTable();
        await createMedicineTable();
        await createOrderTable();
        await createReportsTable();
    } catch (err) {
        console.error('Error during table initialization:', err);
    }
})();

// IMPORTANT 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
