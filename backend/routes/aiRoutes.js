const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  chatWithAI,
  analyzeReport,
  translateText,
  getHealthGuidance,
  processVoice,
  getAIHealth,
  generateDoctorClinicalSummary,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

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

// AI Microservice Proxy Endpoints
router.get('/health', getAIHealth);
router.post('/chat', protect, chatWithAI);
router.post('/analyze-report', protect, upload.single('reportFile'), analyzeReport);
router.post('/translate', protect, translateText);
router.post('/health-guidance', protect, getHealthGuidance);
router.post('/voice', protect, processVoice);
router.post('/doctor-clinical-summary', protect, generateDoctorClinicalSummary);

module.exports = router;
