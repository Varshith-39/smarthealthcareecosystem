const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient)
const getPatientProfile = async (req, res, next) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar')
      .populate({
        path: 'assignedDoctor',
        select: 'name email phone avatar',
        populate: { path: 'user' },
      });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient)
const updatePatientProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalConditions,
      allergies,
      currentMedications,
      previousDiagnoses,
    } = req.body;

    // Update User model fields if provided
    if (name || phone) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name }),
        ...(phone && { phone }),
      });
    }

    // Update PatientProfile fields
    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          ...(dateOfBirth && { dateOfBirth }),
          ...(gender && { gender }),
          ...(bloodGroup && { bloodGroup }),
          ...(address && { address }),
          ...(emergencyContact && { emergencyContact }),
          ...(medicalConditions && { medicalConditions }),
          ...(allergies && { allergies }),
          ...(currentMedications && { currentMedications }),
          ...(previousDiagnoses && { previousDiagnoses }),
        },
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available doctors with profiles
// @route   GET /api/patients/doctors
// @access  Private
const getAvailableDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;

    let doctorQuery = { isActive: true, role: 'DOCTOR' };
    if (search) {
      doctorQuery.name = { $regex: search, $options: 'i' };
    }

    const doctorUsers = await User.find(doctorQuery).select('name email phone avatar');
    const doctorUserIds = doctorUsers.map((u) => u._id);

    let profileFilter = { user: { $in: doctorUserIds } };
    if (specialization && specialization !== 'All') {
      profileFilter.specialization = { $regex: specialization, $options: 'i' };
    }

    const profiles = await DoctorProfile.find(profileFilter).populate('user', 'name email phone avatar');

    res.status(200).json({ success: true, count: profiles.length, doctors: profiles });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getAvailableDoctors,
};
