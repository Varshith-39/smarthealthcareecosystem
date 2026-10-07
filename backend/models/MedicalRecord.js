const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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
      required: false,
    },
    title: {
      type: String,
      required: true,
      default: 'Clinical Consultation Record',
    },
    recordType: {
      type: String,
      enum: ['DIAGNOSIS', 'LAB_REPORT', 'CONSULTATION_NOTE', 'DISCHARGE_SUMMARY'],
      default: 'CONSULTATION_NOTE',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    vitalsSummary: {
      type: String,
      default: '',
    },
    attachments: {
      type: [String],
      default: [],
    },
    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
