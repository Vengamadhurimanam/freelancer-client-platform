const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations', protect, getMyConversations);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
