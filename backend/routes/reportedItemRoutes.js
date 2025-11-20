const express = require('express');
const router = express.Router();
const reportedItemController = require('../controllers/reportedItemController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, reportedItemController.getAllReportedItems);
router.get('/:id', optionalAuth, validateId, reportedItemController.getReportedItemById);

// Protected routes
router.post('/', authenticateToken, reportedItemController.createReportedItem);
router.get('/user/my-reported', authenticateToken, reportedItemController.getUserReportedItems);
router.put('/:id', authenticateToken, validateId, reportedItemController.updateReportedItem);
router.patch('/:id', authenticateToken, validateId, reportedItemController.updateReportedItemStatus);
router.delete('/:id', authenticateToken, validateId, reportedItemController.deleteReportedItem);

module.exports = router;
