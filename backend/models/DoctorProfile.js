const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      default: 'General Physician',
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical License / Registration Number is required'],
      default: 'MED-2024-001',
    },
    hospital: {
      type: String,
      required: [true, 'Hospital / Clinic name is required'],
      default: 'City General Hospital',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    about: {
      type: String,
      default: 'Experienced healthcare professional dedicated to comprehensive patient-centered care.',
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableHours: {
      start: { type: String, default: '09:00 AM' },
      end: { type: String, default: '05:00 PM' },
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
