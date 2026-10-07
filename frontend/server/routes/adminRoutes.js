const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, isAdmin, getAdminStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.put('/users/:id/toggle-status', protect, isAdmin, toggleUserStatus);

module.exports = router;
