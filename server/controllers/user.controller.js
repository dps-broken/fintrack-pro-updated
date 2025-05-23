import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get user profile (alternative to /auth/me)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
      emailPreferences: user.emailPreferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile (name, email)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // Email change might require re-verification logic, not implemented here for simplicity
    if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            res.status(400);
            throw new Error('Email already in use by another account.');
        }
        user.email = req.body.email;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      themePreference: updatedUser.themePreference,
      emailPreferences: updatedUser.emailPreferences,
      // Do not send token here unless it's re-issued
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user password
 * @route   PUT /api/users/password
 * @access  Private
 */
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords.');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long.');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword; // Hashing is handled by pre-save hook
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Incorrect current password');
  }
});

/**
 * @desc    Update user theme preference
 * @route   PUT /api/users/theme
 * @access  Private
 */
const updateThemePreference = asyncHandler(async (req, res) => {
  const { theme } = req.body;
  const allowedThemes = ['light', 'dark', 'system'];

  if (!theme || !allowedThemes.includes(theme)) {
    res.status(400);
    throw new Error(`Invalid theme. Allowed themes are: ${allowedThemes.join(', ')}`);
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.themePreference = theme;
    await user.save();
    res.json({
      message: 'Theme preference updated',
      themePreference: user.themePreference,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user email notification preferences
 * @route   PUT /api/users/email-preferences
 * @access  Private
 */
const updateEmailPreferences = asyncHandler(async (req, res) => {
  const { dailyReport, monthlyReport, budgetAlerts } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (typeof dailyReport === 'boolean') user.emailPreferences.dailyReport = dailyReport;
    if (typeof monthlyReport === 'boolean') user.emailPreferences.monthlyReport = monthlyReport;
    if (typeof budgetAlerts === 'boolean') user.emailPreferences.budgetAlerts = budgetAlerts;

    await user.save();
    res.json({
      message: 'Email preferences updated',
      emailPreferences: user.emailPreferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Add confirmation step on frontend!
    // Optional: Perform cleanup (e.g., delete related data or anonymize)
    // For simplicity, we just delete the user. In a real app, consider data retention policies.
    // await Transaction.deleteMany({ user: user._id });
    // await Category.deleteMany({ user: user._id }); // Only custom ones
    // await Goal.deleteMany({ user: user._id });
    // await Budget.deleteMany({ user: user._id });

    await User.deleteOne({ _id: user._id }); // Mongoose 8+
    // or await user.remove(); for older Mongoose

    res.json({ message: 'User account deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateThemePreference,
  updateEmailPreferences,
  deleteUserAccount,
};