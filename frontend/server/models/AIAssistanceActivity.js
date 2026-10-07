const mongoose = require('mongoose');

const aiAssistanceActivitySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: ['REPORT_EXPLANATION', 'MEDICATION_REMINDER', 'DIET_SUGGESTION', 'CHAT_CONSULTATION'],
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAssistanceActivity', aiAssistanceActivitySchema);
