const mongoose = require('mongoose');

const healthReadingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    heartRate: {
      type: Number, // BPM
      required: true,
    },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
    },
    spo2: {
      type: Number, // percentage, e.g. 98
      required: true,
    },
    temperature: {
      type: Number, // Celsius, e.g. 36.7
      required: true,
    },
    glucose: {
      type: Number, // mg/dL, e.g. 105
      default: 95,
    },
    weight: {
      type: Number, // kg, e.g. 70
      default: 68,
    },
    steps: {
      type: Number,
      default: 4500,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'SIMULATED_IOT', 'WEARABLE_LIVE'],
      default: 'MANUAL',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    riskScore: {
      type: Number,
      default: 15,
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthReading', healthReadingSchema);
