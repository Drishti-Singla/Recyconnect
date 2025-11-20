const express = require('express');
const router = express.Router();
const flagController = require('../controllers/flagController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateFlag, validateId } = require('../middleware/validation');

// Protected routes
router.post('/', authenticateToken, validateFlag, flagController.createFlag);
router.get('/', authenticateToken, isAdmin, flagController.getAllFlags);
router.get('/user/:userId', authenticateToken, flagController.getUserFlags);
router.get('/target/:targetType/:targetId', authenticateToken, flagController.getTargetFlags);
router.get('/count/:targetType/:targetId', flagController.getFlagCounts);
router.patch('/:id', authenticateToken, isAdmin, validateId, flagController.updateFlag);
router.delete('/:id', authenticateToken, validateId, flagController.deleteFlag);

module.exports = router;
