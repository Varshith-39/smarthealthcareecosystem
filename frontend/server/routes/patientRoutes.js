const express = require('express');
const router = express.Router();
const { getPatientProfile, updatePatientProfile, getAvailableDoctors } = require('../controllers/patientController');
const { getDoctorPatients } = require('../controllers/doctorController');
const { protect, isPatient, isDoctorOrAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, isDoctorOrAdmin, getDoctorPatients);
router.get('/profile', protect, isPatient, getPatientProfile);
router.put('/profile', protect, isPatient, updatePatientProfile);
router.get('/doctors', protect, getAvailableDoctors);

module.exports = router;
