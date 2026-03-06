const express = require('express');
const router = express.Router();
const { addDoctor, getAllDoctors, deleteDoctor, updateDoctor } = require('../controllers/doctorController');

router.post('/add', addDoctor);
router.get('/', getAllDoctors);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
