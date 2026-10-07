const express = require('express');
const router = express.Router();
const {
  triggerEmergency,
  getEmergencyAlerts,
  acknowledgeAlert,
  resolveAlert,
} = require('../controllers/emergencyController');
const { protect, isPatient, isDoctorOrAdmin } = require('../middleware/authMiddleware');

router.post('/trigger', protect, isPatient, triggerEmergency);
router.get('/', protect, getEmergencyAlerts);
router.put('/:id/acknowledge', protect, isDoctorOrAdmin, acknowledgeAlert);
router.put('/:id/resolve', protect, isDoctorOrAdmin, resolveAlert);

module.exports = router;
