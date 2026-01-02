const express = require('express');
const router = express.Router();
const reportedItemController = require('../controllers/reportedItemController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, reportedItemController.getAllReportedItems);

// Protected routes - specific routes BEFORE parameterized routes
router.get('/user/my-reported', authenticateToken, reportedItemController.getUserReportedItems);
router.post('/', authenticateToken, reportedItemController.createReportedItem);

// Parameterized routes must come AFTER specific routes
router.get('/:id', optionalAuth, validateId, reportedItemController.getReportedItemById);
router.put('/:id', authenticateToken, validateId, reportedItemController.updateReportedItem);
router.patch('/:id', authenticateToken, validateId, reportedItemController.updateReportedItemStatus);
router.delete('/:id', authenticateToken, validateId, reportedItemController.deleteReportedItem);

module.exports = router;
