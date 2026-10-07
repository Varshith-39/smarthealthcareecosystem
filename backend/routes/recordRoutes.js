const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMedicalRecords);
router.post('/', protect, createMedicalRecord);
router.delete('/:id', protect, deleteMedicalRecord);

module.exports = router;
