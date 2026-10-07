const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'APPOINTMENT_REQUEST',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_CANCELLED',
        'APPOINTMENT_REJECTED',
        'APPOINTMENT_RESCHEDULED',
        'APPOINTMENT_COMPLETED',
        'ABNORMAL_HEALTH_READING',
        'HIGH_RISK_AI_PREDICTION',
        'EMERGENCY_ALERT',
        'PRESCRIPTION_ADDED',
        'MEDICINE_REMINDER',
        'MESSAGE_RECEIVED',
        'MEDICAL_RECORD_UPDATED',
        'SYSTEM_INFO',
      ],
      default: 'SYSTEM_INFO',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
