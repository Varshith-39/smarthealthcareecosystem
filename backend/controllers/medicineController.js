const MedicineReminder = require('../models/MedicineReminder');
const { createNotification } = require('../services/notificationService');

// @desc    Get medicine reminders for a patient
// @route   GET /api/medicines
// @access  Private (Patient / Doctor)
const getMedicines = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user._id;

    const medicines = await MedicineReminder.find({ patientId }).sort({ createdAt: -1 });

    // Calculate adherence statistics
    let totalDosesLogged = 0;
    let takenCount = 0;

    medicines.forEach((med) => {
      med.adherenceLog.forEach((log) => {
        totalDosesLogged++;
        if (log.status === 'TAKEN') takenCount++;
      });
    });

    const adherenceRate = totalDosesLogged > 0 ? Math.round((takenCount / totalDosesLogged) * 100) : 92; // default high baseline

    res.status(200).json({
      success: true,
      count: medicines.length,
      adherenceRate,
      medicines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a medicine reminder
// @route   POST /api/medicines
// @access  Private (Patient)
const addMedicine = async (req, res, next) => {
  try {
    const {
      medicineName,
      dosage,
      frequency,
      reminderTimes,
      startDate,
      endDate,
      instructions,
    } = req.body;

    const reminder = await MedicineReminder.create({
      patientId: req.user._id,
      medicineName,
      dosage: dosage || '500 mg',
      frequency: frequency || 'Twice daily',
      reminderTimes: reminderTimes || ['09:00 AM', '09:00 PM'],
      startDate: startDate || new Date(),
      endDate: endDate || null,
      instructions: instructions || 'Take after meal',
    });

    // Create initial confirmation notification
    await createNotification({
      recipientId: req.user._id,
      type: 'MEDICINE_REMINDER',
      title: 'Medicine Schedule Added',
      message: `Reminder scheduled for ${medicineName} (${dosage}) - ${reminderTimes?.join(', ') || '09:00 AM'}.`,
      link: '/patient/medicines',
    });

    res.status(201).json({
      success: true,
      message: 'Medicine reminder added successfully',
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log medication dose taken or skipped
// @route   POST /api/medicines/:id/log
// @access  Private (Patient)
const logDose = async (req, res, next) => {
  try {
    const { status = 'TAKEN', doseTime = 'Now' } = req.body;

    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine reminder not found' });
    }

    reminder.adherenceLog.push({
      date: new Date(),
      doseTime,
      status,
    });

    await reminder.save();

    res.status(200).json({
      success: true,
      message: `Dose recorded as ${status}`,
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger instant demo reminder notification
// @route   POST /api/medicines/:id/trigger-reminder
// @access  Private (Patient)
const triggerDemoReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    await createNotification({
      recipientId: req.user._id,
      type: 'MEDICINE_REMINDER',
      title: `Medicine Reminder: ${reminder.medicineName}`,
      message: `Time to take your scheduled dose: ${reminder.medicineName} (${reminder.dosage}). ${reminder.instructions}`,
      link: '/patient/medicines',
    });

    res.status(200).json({
      success: true,
      message: 'Demo reminder notification triggered!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine reminder
// @route   DELETE /api/medicines/:id
// @access  Private (Patient)
const deleteMedicine = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Medicine reminder not found' });
    }

    res.status(200).json({ success: true, message: 'Medicine reminder removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  logDose,
  triggerDemoReminder,
  deleteMedicine,
};
