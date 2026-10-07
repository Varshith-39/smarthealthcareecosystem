const User = require('../models/User');
const Appointment = require('../models/Appointment');
const EmergencyAlert = require('../models/EmergencyAlert');
const HealthReading = require('../models/HealthReading');
const Prescription = require('../models/Prescription');

// @desc    Get system-wide summary statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'PATIENT' });
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
    const totalAppointments = await Appointment.countDocuments();
    const totalEmergencyAlerts = await EmergencyAlert.countDocuments();
    const activeEmergencyAlerts = await EmergencyAlert.countDocuments({ status: 'TRIGGERED' });
    const totalReadings = await HealthReading.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Recent 5 emergency alerts
    const recentAlerts = await EmergencyAlert.find()
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Appointment status breakdown
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalEmergencyAlerts,
        activeEmergencyAlerts,
        totalReadings,
        totalPrescriptions,
        activeUsers,
        recentAlerts,
        appointmentsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let filter = {};
    if (role) filter.role = role.toUpperCase();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
};
