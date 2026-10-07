const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      default: '10:00 AM',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'REJECTED'],
      default: 'PENDING',
    },
    reason: {
      type: String,
      required: [true, 'Reason for consultation is required'],
      default: 'General Health Checkup',
    },
    notes: {
      type: String,
      default: '',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    consultationRoomId: {
      type: String,
      default: () => `consult-${Math.random().toString(36).substring(2, 9)}`,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
