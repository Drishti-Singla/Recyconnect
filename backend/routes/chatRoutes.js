const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// All chat routes require authentication
router.get('/conversations', authenticateToken, chatController.getConversations);
router.get('/messages/:userId', authenticateToken, chatController.getChatMessages);
router.post('/messages', authenticateToken, chatController.sendChatMessage);
router.patch('/messages/:id/read', authenticateToken, validateId, chatController.markMessageAsRead);
router.delete('/messages/:id', authenticateToken, validateId, chatController.deleteChatMessage);
router.get('/unread-count', authenticateToken, chatController.getUnreadCount);

module.exports = router;
