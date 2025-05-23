import express from 'express';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus // New route for budget consumption status
} from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { createBudgetValidation } from '../middleware/validation.middleware.js'; // Assuming validation exists

const router = express.Router();

router.use(protect);

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', createBudgetValidation, createBudget);

// @route   GET /api/budgets
// @desc    Get all budgets for the logged-in user
// @access  Private
router.get('/', getBudgets);

// @route   GET /api/budgets/:id
// @desc    Get a single budget by ID
// @access  Private
router.get('/:id', getBudgetById);

// @route   GET /api/budgets/:id/status
// @desc    Get consumption status for a specific budget
// @access  Private
router.get('/:id/status', getBudgetStatus);


// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', createBudgetValidation, updateBudget);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', deleteBudget);

export default router;