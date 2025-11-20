const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage, validateId } = require('../middleware/validation');

// All message routes require authentication
router.post('/', authenticateToken, validateMessage, messageController.sendMessage);
router.get('/conversations', authenticateToken, messageController.getConversations);
router.get('/conversation/:userId', authenticateToken, messageController.getConversation);
router.get('/item/:itemId', authenticateToken, messageController.getItemMessages);
router.patch('/:id/read', authenticateToken, validateId, messageController.markAsRead);
router.delete('/:id', authenticateToken, validateId, messageController.deleteMessage);
router.get('/unread-count', authenticateToken, messageController.getUnreadCount);

module.exports = router;
