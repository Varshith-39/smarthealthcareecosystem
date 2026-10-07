const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorPatients,
  getPatientDossier,
  updateDoctorProfile,
  getDoctorStats,
} = require('../controllers/doctorController');
const { protect, isDoctor, isDoctorOrAdmin } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/stats', protect, isDoctor, getDoctorStats);
router.get('/patients/all', protect, isDoctor, getDoctorPatients);
router.get('/patient/:patientId', protect, isDoctorOrAdmin, getPatientDossier);
router.put('/profile', protect, isDoctor, updateDoctorProfile);
router.get('/:id', getDoctorById);

module.exports = router;
