const mongoose = require('mongoose');

const medicineReminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 500 mg)'],
      default: '500 mg',
    },
    frequency: {
      type: String,
      required: true,
      default: '2 times daily',
    },
    reminderTimes: {
      type: [String],
      default: ['09:00 AM', '09:00 PM'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    instructions: {
      type: String,
      default: 'Take after meal with a full glass of water',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adherenceLog: [
      {
        date: { type: Date, default: Date.now },
        doseTime: { type: String },
        status: { type: String, enum: ['TAKEN', 'SKIPPED', 'MISSED'], default: 'TAKEN' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
