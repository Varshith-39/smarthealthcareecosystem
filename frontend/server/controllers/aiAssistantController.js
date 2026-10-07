const AIAssistanceActivity = require('../models/AIAssistanceActivity');
const MedicineReminder = require('../models/MedicineReminder');
const { createNotification } = require('../services/notificationService');
const aiAssistantService = require('../services/aiAssistant');

const { analyzeReport, chatWithAI } = require('./aiController');

// @desc    Analyze uploaded PDF or Image report (connected to FastAPI AI service)
// @route   POST /api/ai-assistant/analyze-report-file
// @access  Private (Patient)
const analyzeReportFile = async (req, res, next) => {
  return analyzeReport(req, res, next);
};

// @desc    Explain medical report parameters from text
// @route   POST /api/ai-assistant/explain-report
// @access  Private (Patient)
const explainReport = async (req, res, next) => {
  try {
    const { reportText } = req.body;

    const explanation = await aiAssistantService.explainReport(reportText);

    // Record high-level activity
    await AIAssistanceActivity.create({
      patientId: req.user._id,
      actionType: 'REPORT_EXPLANATION',
      title: 'Medical Report Explanation',
      summary: `Analyzed ${explanation.parameters.length} parameter(s) from entered medical report.`,
      details: {
        parametersCount: explanation.parameters.length,
        parametersList: explanation.parameters.map((p) => p.parameter),
      },
    });

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule medication reminder via AI Assistant
// @route   POST /api/ai-assistant/schedule-reminder
// @access  Private (Patient)
const scheduleMedicationReminder = async (req, res, next) => {
  try {
    const {
      medicineName,
      dosage = '500 mg',
      frequency = 'Twice daily',
      startDate = new Date(),
      endDate = null,
      reminderTime = '9:00 PM',
      time = '9:00 PM',
      instructions = 'Take after meals with water',
    } = req.body;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a medicine name',
      });
    }

    const preferredTime = time || reminderTime || '9:00 PM';

    // Format reminder times into a clean array
    let reminderTimes = [];
    if (Array.isArray(preferredTime)) {
      reminderTimes = preferredTime;
    } else if (typeof preferredTime === 'string') {
      reminderTimes = preferredTime
        .split(/[,&]|and/i)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    if (reminderTimes.length === 0) {
      reminderTimes = ['9:00 PM'];
    }

    // Persist to MedicineReminder model
    const reminder = await MedicineReminder.create({
      patientId: req.user._id,
      medicineName: medicineName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      reminderTimes,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      instructions: instructions.trim(),
      isActive: true,
    });

    const timeDisplay = reminderTimes.join(', ');

    // Record AI Assistance Activity
    await AIAssistanceActivity.create({
      patientId: req.user._id,
      actionType: 'MEDICATION_REMINDER',
      title: 'Medication Reminder Created',
      summary: `Reminder scheduled: Take ${medicineName} ${dosage} at ${timeDisplay}.`,
      details: {
        medicineName,
        dosage,
        frequency,
        reminderTimes,
      },
    });

    // Send confirmation notification to patient in requested format
    await createNotification({
      recipientId: req.user._id,
      type: 'MEDICINE_REMINDER',
      title: 'Reminder Scheduled',
      message: `Reminder scheduled: Take ${medicineName} ${dosage} at ${timeDisplay}.`,
      link: '/patient/medicines',
      metadata: { reminderId: reminder._id },
    });

    res.status(201).json({
      success: true,
      message: `Reminder scheduled: Take ${medicineName} ${dosage} at ${timeDisplay}.`,
      reminder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger immediate simulation dose alert
// @route   POST /api/ai-assistant/trigger-due-reminder
// @access  Private (Patient)
const triggerDueReminder = async (req, res, next) => {
  try {
    const { medicineName = 'Metformin', dosage = '500 mg' } = req.body;

    await createNotification({
      recipientId: req.user._id,
      type: 'MEDICINE_REMINDER',
      title: `Medication Reminder: ${medicineName}`,
      message: `Medication Reminder: Please take ${medicineName} ${dosage}.`,
      link: '/patient/medicines',
    });

    res.status(200).json({
      success: true,
      message: `Medication Reminder: Please take ${medicineName} ${dosage}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate tailored diet & wellness suggestions
// @route   POST /api/ai-assistant/diet-suggestions
// @access  Private (Patient)
const getDietSuggestions = async (req, res, next) => {
  try {
    const { medication, goal, preference, reportValues, reportParameters } = req.body;

    const data = await aiAssistantService.generateDietSuggestions({
      medication,
      goal,
      preference,
      reportValues,
      reportParameters,
    });

    // Record high-level activity
    await AIAssistanceActivity.create({
      patientId: req.user._id,
      actionType: 'DIET_SUGGESTION',
      title: 'Diet Suggestion Generated',
      summary: `Goal: ${goal || 'General Health'} | Medicine: ${medication || 'None'}`,
      details: { goal, medication, preference },
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI Health Assistant (connected to FastAPI AI service)
// @route   POST /api/ai-assistant/chat
// @access  Private (Patient)
const chatWithAssistant = async (req, res, next) => {
  return chatWithAI(req, res, next);
};

// @desc    Get recent AI assistance activity for logged in patient
// @route   GET /api/ai-assistant/recent-activity
// @access  Private (Patient)
const getRecentActivity = async (req, res, next) => {
  try {
    const activities = await AIAssistanceActivity.find({ patientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get safe read-only AI activity summary for Doctor
// @route   GET /api/ai-assistant/patient-activity/:patientId
// @access  Private (Doctor)
const getPatientActivityForDoctor = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const activities = await AIAssistanceActivity.find({ patientId })
      .select('actionType title summary createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeReportFile,
  explainReport,
  scheduleMedicationReminder,
  triggerDueReminder,
  getDietSuggestions,
  chatWithAssistant,
  getRecentActivity,
  getPatientActivityForDoctor,
};
