const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/contacts/list', protect, getContacts);
router.get('/:userId', protect, getConversation);

module.exports = router;
