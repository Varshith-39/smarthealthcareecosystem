const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_healthcare_super_secret_jwt_key_2026_major_project');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or account deactivated' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated by administrator' });
      }

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

const isPatient = authorize('PATIENT');
const isDoctor = authorize('DOCTOR');
const isAdmin = authorize('ADMIN');
const isDoctorOrAdmin = authorize('DOCTOR', 'ADMIN');

module.exports = {
  protect,
  authorize,
  isPatient,
  isDoctor,
  isAdmin,
  isDoctorOrAdmin,
};
