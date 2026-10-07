const Prescription = require('../models/Prescription');
const User = require('../models/User');
const MedicineReminder = require('../models/MedicineReminder');
const { createNotification } = require('../services/notificationService');

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      query.doctorId = req.user._id;
    } else if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name email phone avatar')
      .populate('patientId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor creates prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, diagnosis, generalAdvice, followUpDate, autoScheduleReminders } = req.body;
    const doctorId = req.user._id;

    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide patient and at least one medication' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      medicines,
      diagnosis: diagnosis || '',
      generalAdvice: generalAdvice || 'Follow dosage instructions strictly and take adequate rest.',
      followUpDate: followUpDate || null,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('doctorId', 'name email phone avatar')
      .populate('patientId', 'name email phone avatar');

    // Optionally auto-create medicine reminders for the patient
    if (autoScheduleReminders) {
      for (const med of medicines) {
        await MedicineReminder.create({
          patientId,
          medicineName: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          reminderTimes: ['09:00 AM', '09:00 PM'],
          instructions: med.instructions || 'As prescribed by doctor',
        });
      }
    }

    // Notify Patient
    const docName = req.user.name.startsWith('Dr.') ? req.user.name : `Dr. ${req.user.name}`;
    await createNotification({
      recipientId: patientId,
      senderId: doctorId,
      type: 'PRESCRIPTION_ADDED',
      title: 'New Digital Prescription Issued',
      message: `${docName} issued a new prescription for: ${medicines.map((m) => m.name).join(', ')}.`,
      link: '/patient/records',
      metadata: { prescriptionId: prescription._id },
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created and sent to patient',
      prescription: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'name email phone avatar')
      .populate('patientId', 'name email phone avatar');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
};
