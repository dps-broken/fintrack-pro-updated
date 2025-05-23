import express from 'express';
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalProgress, // Specific route to update currentAmount
} from '../controllers/goal.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { createGoalValidation } from '../middleware/validation.middleware.js'; // Assuming validation exists
import { body } from 'express-validator'; // For specific validation

const router = express.Router();

router.use(protect);

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', createGoalValidation, createGoal);

// @route   GET /api/goals
// @desc    Get all goals for the logged-in user
// @access  Private
router.get('/', getGoals);

// @route   GET /api/goals/:id
// @desc    Get a single goal by ID
// @access  Private
router.get('/:id', getGoalById);

// @route   PUT /api/goals/:id
// @desc    Update a goal's details (name, targetAmount, deadline)
// @access  Private
router.put('/:id', createGoalValidation, updateGoal);

// @route   PATCH /api/goals/:id/progress  (Using PATCH for partial update)
// @desc    Update a goal's current progress (currentAmount)
// @access  Private
router.patch(
  '/:id/progress',
  [
    body('currentAmount')
      .isNumeric().withMessage('Current amount must be a number.')
      .toFloat()
      .isFloat({ gte: 0 }).withMessage('Current amount cannot be negative.')
  ],
  // You might need a specific controller or modify updateGoal for this
  updateGoalProgress
);

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', deleteGoal);

export default router;