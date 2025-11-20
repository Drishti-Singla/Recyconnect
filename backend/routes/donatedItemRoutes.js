const express = require('express');
const router = express.Router();
const donatedItemController = require('../controllers/donatedItemController');
const { authenticateToken, optionalAuth, isAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, donatedItemController.getAllDonatedItems);
router.get('/:id', optionalAuth, validateId, donatedItemController.getDonatedItemById);

// Protected routes
router.post('/', authenticateToken, donatedItemController.createDonatedItem);
router.get('/user/my-donations', authenticateToken, donatedItemController.getUserDonatedItems);
router.put('/:id', authenticateToken, validateId, donatedItemController.updateDonatedItem);
router.patch('/:id', authenticateToken, validateId, donatedItemController.updateDonatedItemStatus);
router.delete('/:id', authenticateToken, validateId, donatedItemController.deleteDonatedItem);

module.exports = router;
