import express from 'express';
import {
  updateUserProfile,
  updateUserPassword,
  getUserProfile, // Redundant if auth/me serves the same, but can be specific
  updateThemePreference,
  updateEmailPreferences,
  deleteUserAccount, // Be very careful with this
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
// Add validation middleware as needed

const router = express.Router();

// All routes below are protected
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile (could be same as /auth/me)
// @access  Private
router.get('/profile', getUserProfile); // Or just rely on /auth/me and update through specific routes

// @route   PUT /api/users/profile
// @desc    Update user profile (name, email - email change might need re-verification)
// @access  Private
router.put('/profile', updateUserProfile); // Add validation

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', updateUserPassword); // Add validation (currentPassword, newPassword)

// @route   PUT /api/users/theme
// @desc    Update user theme preference
// @access  Private
router.put('/theme', updateThemePreference); // Add validation (theme: light/dark/system)

// @route   PUT /api/users/email-preferences
// @desc    Update user email notification preferences
// @access  Private
router.put('/email-preferences', updateEmailPreferences); // Add validation

// @route   DELETE /api/users/account
// @desc    Delete user account (handle with extreme caution and confirmation)
// @access  Private
router.delete('/account', deleteUserAccount);

export default router;