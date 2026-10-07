const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
} = require('../controllers/prescriptionController');
const { protect, isDoctorOrAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, getPrescriptions);
router.get('/:id', protect, getPrescriptionById);
router.post('/', protect, isDoctorOrAdmin, createPrescription);

module.exports = router;
