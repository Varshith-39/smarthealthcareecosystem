const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const { createNotification } = require('../services/notificationService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smart_healthcare_super_secret_jwt_key_2026_major_project', {
    expiresIn: '30d',
  });
};

// @desc    Register a new patient or doctor
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'PATIENT',
      phone,
      // Patient specific
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalConditions,
      // Doctor specific
      specialization,
      licenseNumber,
      hospital,
      experienceYears,
      consultationFee,
      about,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role.toUpperCase(),
      phone: phone || '',
    });

    let profileData = null;

    if (user.role === 'PATIENT') {
      profileData = await PatientProfile.create({
        user: user._id,
        dateOfBirth: dateOfBirth || null,
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'O+',
        address: address || '',
        emergencyContact: emergencyContact || { name: '', phone: '', relationship: 'Family' },
        medicalConditions: Array.isArray(medicalConditions)
          ? medicalConditions
          : medicalConditions ? medicalConditions.split(',').map((s) => s.trim()) : [],
      });

      // Welcome notification
      await createNotification({
        recipientId: user._id,
        type: 'SYSTEM_INFO',
        title: 'Welcome to Smart Healthcare Ecosystem',
        message: 'Your patient account has been created. You can now monitor your health vitals and consult doctors.',
      });
    } else if (user.role === 'DOCTOR') {
      profileData = await DoctorProfile.create({
        user: user._id,
        specialization: specialization || 'General Physician',
        licenseNumber: licenseNumber || `MED-${Math.floor(10000 + Math.random() * 90000)}`,
        hospital: hospital || 'Apex Multispecialty Hospital',
        experienceYears: Number(experienceYears) || 5,
        consultationFee: Number(consultationFee) || 500,
        about: about || '',
      });

      await createNotification({
        recipientId: user._id,
        type: 'SYSTEM_INFO',
        title: 'Welcome Dr. ' + user.name,
        message: 'Your doctor profile is active. You can now review patient telemetry and manage consultations.',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by administrator' });
    }

    // Optional role check validation if specified from frontend selector
    if (role && user.role !== role.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role.toUpperCase()}`,
      });
    }

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
