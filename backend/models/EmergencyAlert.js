const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    healthData: {
      heartRate: Number,
      bloodPressure: { systolic: Number, diastolic: Number },
      spo2: Number,
      temperature: Number,
      glucose: Number,
    },
    location: {
      address: { type: String, default: 'Sector 62, Electronic City, Metro Zone' },
      lat: { type: Number, default: 28.628 },
      lng: { type: Number, default: 77.375 },
    },
    message: {
      type: String,
      default: 'Emergency alert activated by patient! Immediate medical attention required.',
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    status: {
      type: String,
      enum: ['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'TRIGGERED',
      index: true,
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
