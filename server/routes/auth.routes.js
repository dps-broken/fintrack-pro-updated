import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  // forgotPassword, // To be implemented
  // resetPassword,  // To be implemented
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { registerUserValidation } from '../middleware/validation.middleware.js'; // Assuming you have this for login too or separate

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUserValidation, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser); // Add validation for login if needed

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user (e.g., clear cookie if using httpOnly cookies)
// @access  Private (or Public depending on how you handle client-side token removal)
router.post('/logout', logoutUser); // `protect` might be needed if server-side session invalidation happens

// TODO: Add routes for forgot password and reset password
// router.post('/forgotpassword', forgotPassword);
// router.put('/resetpassword/:resettoken', resetPassword);

export default router;