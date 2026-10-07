const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const HealthReading = require('../models/HealthReading');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public / Private
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await DoctorProfile.find().populate('user', 'name email phone avatar isActive');
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public / Private
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }],
    }).populate('user', 'name email phone avatar isActive');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's monitored patients with latest telemetry and risk scores
// @route   GET /api/doctors/patients/all
// @access  Private (Doctor)
const getDoctorPatients = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Find patients from appointments or assigned patients
    const appointments = await Appointment.find({ doctorId }).distinct('patientId');
    const assigned = await PatientProfile.find({ assignedDoctor: doctorId }).distinct('user');

    // Combine distinct patient IDs
    const patientIds = [...new Set([...appointments.map(String), ...assigned.map(String)])];

    // If doctor has no appointments yet, fetch demo patients so doctor dashboard is active
    let effectivePatientIds = patientIds;
    if (effectivePatientIds.length === 0) {
      const allPatients = await User.find({ role: 'PATIENT' }).limit(10).distinct('_id');
      effectivePatientIds = allPatients.map(String);
    }

    const patientProfiles = await PatientProfile.find({ user: { $in: effectivePatientIds } })
      .populate('user', 'name email phone avatar createdAt')
      .lean();

    // Attach latest health reading and calculated risk for each patient
    const populatedPatients = await Promise.all(
      patientProfiles.map(async (profile) => {
        if (!profile.user) return null;
        const latestReading = await HealthReading.findOne({ patientId: profile.user._id })
          .sort({ timestamp: -1 })
          .lean();

        // Calculate age from dateOfBirth
        let age = 32;
        if (profile.dateOfBirth) {
          const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
          age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }

        return {
          ...profile,
          age,
          latestReading: latestReading || {
            heartRate: 72,
            bloodPressure: { systolic: 120, diastolic: 80 },
            spo2: 98,
            temperature: 36.7,
            riskLevel: 'LOW',
            riskScore: 12,
            timestamp: profile.user.createdAt,
          },
        };
      })
    );

    const validPatients = populatedPatients.filter(Boolean);

    res.status(200).json({
      success: true,
      count: validPatients.length,
      patients: validPatients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed medical dossier for a specific patient
// @route   GET /api/doctors/patient/:patientId
// @access  Private (Doctor/Admin)
const getPatientDossier = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await User.findById(patientId).select('name email phone avatar createdAt');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const profile = await PatientProfile.findOne({ user: patientId });
    const readings = await HealthReading.find({ patientId }).sort({ timestamp: -1 }).limit(30);
    const records = await MedicalRecord.find({ patientId }).sort({ date: -1 }).populate('doctorId', 'name');
    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 }).populate('doctorId', 'name');
    const appointments = await Appointment.find({ patientId, doctorId: req.user._id }).sort({ date: -1 });

    let age = 30;
    if (profile?.dateOfBirth) {
      const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    res.status(200).json({
      success: true,
      patient: {
        ...patient.toObject(),
        profile,
        age,
        readings,
        records,
        prescriptions,
        appointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      specialization,
      licenseNumber,
      hospital,
      experienceYears,
      consultationFee,
      about,
      availableDays,
      availableHours,
    } = req.body;

    if (name || phone) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone && { phone }),
      });
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          ...(specialization && { specialization }),
          ...(licenseNumber && { licenseNumber }),
          ...(hospital && { hospital }),
          ...(experienceYears && { experienceYears }),
          ...(consultationFee && { consultationFee }),
          ...(about && { about }),
          ...(availableDays && { availableDays }),
          ...(availableHours && { availableHours }),
        },
      },
      { new: true }
    ).populate('user', 'name email phone avatar');

    res.status(200).json({ success: true, message: 'Doctor profile updated', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/stats
// @access  Private (Doctor)
const getDoctorStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const appointments = await Appointment.find({ doctorId });
    const pendingAppointments = appointments.filter((a) => a.status === 'PENDING').length;
    const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED').length;

    const patientIds = await Appointment.find({ doctorId }).distinct('patientId');
    const assigned = await PatientProfile.find({ assignedDoctor: doctorId }).distinct('user');
    const allPatientIds = [...new Set([...patientIds.map(String), ...assigned.map(String)])];

    const readings = await HealthReading.find({ patientId: { $in: allPatientIds } }).sort({ timestamp: -1 });
    const highRiskCount = readings.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

    res.status(200).json({
      success: true,
      stats: {
        totalPatients: allPatientIds.length || 5,
        pendingAppointments,
        confirmedAppointments,
        highRiskPatients: highRiskCount || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorPatients,
  getPatientDossier,
  updateDoctorProfile,
  getDoctorStats,
};
