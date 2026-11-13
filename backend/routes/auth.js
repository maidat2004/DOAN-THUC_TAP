const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.use(authenticate);

router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);

// Admin routes
router.post('/users', authorize('admin'), authController.createUserByAdmin);
router.get('/users', authorize('admin'), authController.getAllUsers);
router.put('/users/:userId', authorize('admin'), authController.updateUser);
router.delete('/users/:userId', authorize('admin'), authController.deleteUser);


module.exports = router;
