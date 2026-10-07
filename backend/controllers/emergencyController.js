const EmergencyAlert = require('../models/EmergencyAlert');
const HealthReading = require('../models/HealthReading');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Trigger emergency alert
// @route   POST /api/emergency/trigger
// @access  Private (Patient)
const triggerEmergency = async (req, res, next) => {
  try {
    const patientId = req.user._id;
    const { message, location } = req.body;

    // Get latest vitals snapshot
    const latestReading = await HealthReading.findOne({ patientId }).sort({ timestamp: -1 });
    const profile = await PatientProfile.findOne({ user: patientId });

    // Target doctor: assigned doctor or all active doctors
    let targetDoctorId = profile?.assignedDoctor;
    if (!targetDoctorId) {
      const anyDoctor = await User.findOne({ role: 'DOCTOR', isActive: true });
      if (anyDoctor) targetDoctorId = anyDoctor._id;
    }

    const alert = await EmergencyAlert.create({
      patientId,
      doctorId: targetDoctorId,
      healthData: {
        heartRate: latestReading?.heartRate || 118,
        bloodPressure: latestReading?.bloodPressure || { systolic: 155, diastolic: 98 },
        spo2: latestReading?.spo2 || 91,
        temperature: latestReading?.temperature || 38.8,
        glucose: latestReading?.glucose || 145,
      },
      location: location || {
        address: profile?.address || 'Sector 62, Metro Tech Zone, City Center',
        lat: 28.628,
        lng: 77.375,
      },
      message: message || 'Emergency SOS button triggered by patient. Vitals indicate acute distress.',
      emergencyContact: profile?.emergencyContact || {
        name: 'Primary Contact',
        phone: '9876543210',
        relationship: 'Spouse',
      },
      status: 'TRIGGERED',
    });

    const populated = await EmergencyAlert.findById(alert._id)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar');

    // 1. Notify PATIENT
    await createNotification({
      recipientId: patientId,
      type: 'EMERGENCY_ALERT',
      title: '🚨 Emergency Alert Activated',
      message: 'Your emergency distress signal has been broadcast. Healthcare providers and emergency contacts are notified.',
      link: '/patient/emergency',
      metadata: { alertId: alert._id },
    });

    // 2. Notify DOCTOR(S)
    if (targetDoctorId) {
      await createNotification({
        recipientId: targetDoctorId,
        senderId: patientId,
        type: 'EMERGENCY_ALERT',
        title: `🚨 CRITICAL: Emergency Alert from ${req.user.name}`,
        message: `Patient ${req.user.name} activated SOS! Latest Vitals: SpO2 ${alert.healthData.spo2}%, HR ${alert.healthData.heartRate} BPM, BP ${alert.healthData.bloodPressure.systolic}/${alert.healthData.bloodPressure.diastolic}. Address: ${alert.location.address}`,
        link: '/doctor/emergency',
        metadata: { alertId: alert._id, patientId },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert dispatched immediately',
      alert: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency alerts (role filtered)
// @route   GET /api/emergency
// @access  Private
const getEmergencyAlerts = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      // Doctor sees alerts directed to them or unassigned/active
      query.$or = [{ doctorId: req.user._id }, { doctorId: null }, { status: 'TRIGGERED' }];
    }

    const alerts = await EmergencyAlert.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge emergency alert
// @route   PUT /api/emergency/:id/acknowledge
// @access  Private (Doctor / Admin)
const acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date();
    alert.doctorId = req.user._id;
    await alert.save();

    // Notify patient
    await createNotification({
      recipientId: alert.patientId._id,
      senderId: req.user._id,
      type: 'EMERGENCY_ALERT',
      title: 'Emergency Alert Acknowledged',
      message: `Dr. ${req.user.name} has acknowledged your SOS alert and is coordinating immediate emergency assistance.`,
      link: '/patient/emergency',
      metadata: { alertId: alert._id },
    });

    res.status(200).json({
      success: true,
      message: 'Emergency alert marked as acknowledged',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark emergency alert resolved
// @route   PUT /api/emergency/:id/resolve
// @access  Private (Doctor / Admin)
const resolveAlert = async (req, res, next) => {
  try {
    const { doctorNotes } = req.body;

    const alert = await EmergencyAlert.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    alert.doctorNotes = doctorNotes || 'Emergency intervention completed. Patient condition stabilized.';
    await alert.save();

    // Notify patient
    await createNotification({
      recipientId: alert.patientId._id,
      senderId: req.user._id,
      type: 'EMERGENCY_ALERT',
      title: 'Emergency Incident Resolved',
      message: `Dr. ${req.user.name} marked your emergency alert as resolved. Notes: ${alert.doctorNotes}`,
      link: '/patient/emergency',
      metadata: { alertId: alert._id },
    });

    res.status(200).json({
      success: true,
      message: 'Emergency alert resolved',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerEmergency,
  getEmergencyAlerts,
  acknowledgeAlert,
  resolveAlert,
};
