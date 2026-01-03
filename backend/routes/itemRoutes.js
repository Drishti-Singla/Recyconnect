const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateItem, validateId } = require('../middleware/validation');

// Public routes (with optional auth to get user-specific data)
router.get('/', optionalAuth, itemController.getAllItems);

// Protected routes - put specific routes before parameterized routes
router.post('/', authenticateToken, validateItem, itemController.createItem);
router.get('/user/:userId', authenticateToken, itemController.getUserItems);
router.get('/:id', optionalAuth, validateId, itemController.getItemById);
router.put('/:id', authenticateToken, validateId, itemController.updateItem);
router.delete('/:id', authenticateToken, validateId, itemController.deleteItem);

module.exports = router;
