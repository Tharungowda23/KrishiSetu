const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} = require('../controllers/messagingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
