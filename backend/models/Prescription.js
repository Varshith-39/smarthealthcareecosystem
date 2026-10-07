const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
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
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500 mg"
        frequency: { type: String, required: true }, // e.g. "Twice daily after meals"
        duration: { type: String, default: '7 days' }, // e.g. "5 days"
        instructions: { type: String, default: '' }, // e.g. "Drink plenty of water"
      },
    ],
    diagnosis: {
      type: String,
      default: '',
    },
    generalAdvice: {
      type: String,
      default: 'Take rest, maintain proper hydration, and report any adverse reactions.',
    },
    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
