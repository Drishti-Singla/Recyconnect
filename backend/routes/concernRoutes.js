const express = require('express');
const router = express.Router();
const concernController = require('../controllers/concernController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateConcern, validateId } = require('../middleware/validation');

// Protected routes
router.post('/', authenticateToken, validateConcern, concernController.createConcern);
router.get('/my-concerns', authenticateToken, concernController.getUserConcerns);
router.get('/', authenticateToken, isAdmin, concernController.getAllConcerns);
router.get('/:id', authenticateToken, validateId, concernController.getConcernById);
router.patch('/:id', authenticateToken, validateId, concernController.updateConcernStatus);
router.delete('/:id', authenticateToken, validateId, concernController.deleteConcern);

module.exports = router;
