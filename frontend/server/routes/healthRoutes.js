const express = require('express');
const router = express.Router();
const {
  addHealthReading,
  simulateIoTReading,
  getHealthReadings,
  getRiskAssessment,
} = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addHealthReading);
router.post('/simulate-iot', protect, simulateIoTReading);
router.get('/', protect, getHealthReadings);
router.get('/risk-assessment', protect, getRiskAssessment);
router.get('/risk-assessment/:patientId', protect, getRiskAssessment);

module.exports = router;
