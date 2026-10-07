const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Get medical records for a patient
// @route   GET /api/medical-records
// @access  Private
const getMedicalRecords = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user._id;

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name email phone avatar')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a medical record
// @route   POST /api/medical-records
// @access  Private (Patient / Doctor)
const createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId: targetPatientId, title, recordType, diagnosis, notes, vitalsSummary, followUpDate, attachments } = req.body;
    
    // Determine patientId: if Doctor, use provided targetPatientId; if Patient, use their own ID
    const isDoctor = req.user.role === 'DOCTOR';
    const patientId = isDoctor ? targetPatientId : req.user._id;
    const doctorId = isDoctor ? req.user._id : null;

    if (!patientId || !title) {
      return res.status(400).json({ success: false, message: 'Please provide patient ID and record title' });
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId,
      title,
      recordType: recordType || (isDoctor ? 'CONSULTATION_NOTE' : 'LAB_REPORT'),
      diagnosis: diagnosis || '',
      notes: notes || '',
      vitalsSummary: vitalsSummary || '',
      attachments: attachments || [],
      followUpDate: followUpDate || null,
    });

    const populated = await MedicalRecord.findById(record._id).populate('doctorId', 'name email avatar');

    // Notify Patient if doctor created record
    if (isDoctor && patientId.toString() !== req.user._id.toString()) {
      const docName = req.user.name.startsWith('Dr.') ? req.user.name : `Dr. ${req.user.name}`;
      await createNotification({
        recipientId: patientId,
        senderId: doctorId,
        type: 'MEDICAL_RECORD_UPDATED',
        title: 'New Medical Record Added',
        message: `${docName} added a new record: "${title}".`,
        link: '/patient/records',
        metadata: { recordId: record._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/medical-records/:id
// @access  Private
const deleteMedicalRecord = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    }

    const record = await MedicalRecord.findOneAndDelete(query);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Medical record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  createMedicalRecord,
  deleteMedicalRecord,
};
