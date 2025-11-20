const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateRegister, validateLogin, validateId } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/change-password', authenticateToken, userController.changePassword);
router.delete('/profile', authenticateToken, userController.deleteAccount);

// Admin routes
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, validateId, userController.getUserById);
router.put('/:id', authenticateToken, isAdmin, validateId, userController.updateUser);
router.delete('/:id', authenticateToken, isAdmin, validateId, userController.deleteUser);

module.exports = router;
