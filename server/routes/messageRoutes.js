const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
