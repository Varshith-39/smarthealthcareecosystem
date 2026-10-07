const express = require('express');
const router = express.Router();
const {
  getMedicines,
  addMedicine,
  logDose,
  triggerDemoReminder,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMedicines).post(protect, addMedicine);
router.route('/:id/log').post(protect, logDose);
router.route('/:id/trigger-reminder').post(protect, triggerDemoReminder);
router.route('/:id').delete(protect, deleteMedicine);

module.exports = router;
