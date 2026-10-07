const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  analyzeReportFile,
  explainReport,
  scheduleMedicationReminder,
  triggerDueReminder,
  getDietSuggestions,
  chatWithAssistant,
  getRecentActivity,
  getPatientActivityForDoctor,
} = require('../controllers/aiAssistantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer for in-memory processing (max 10MB, PDF/JPG/JPEG/PNG)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB maximum
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ext = file.originalname.toLowerCase();
    const isAllowedExt = ext.endsWith('.pdf') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');

    if (allowedMimes.includes(file.mimetype) || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG medical report.'));
    }
  },
});

// Patient accessible AI endpoints
router.post('/analyze-report-file', protect, upload.single('reportFile'), analyzeReportFile);
router.post('/explain-report', protect, explainReport);
router.post('/schedule-reminder', protect, scheduleMedicationReminder);
router.post('/trigger-due-reminder', protect, triggerDueReminder);
router.post('/diet-suggestions', protect, getDietSuggestions);
router.post('/chat', protect, chatWithAssistant);
router.get('/recent-activity', protect, getRecentActivity);

// Doctor read-only indicator endpoint for patient AI activity
router.get('/patient-activity/:patientId', protect, authorize('DOCTOR', 'ADMIN'), getPatientActivityForDoctor);

module.exports = router;
