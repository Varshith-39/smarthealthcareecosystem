const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createAppointment).get(protect, getAppointments);
router.route('/:id/status').put(protect, updateAppointmentStatus);

module.exports = router;
