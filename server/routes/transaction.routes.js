import express from 'express';
import {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { createTransactionValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(protect); // All transaction routes are protected

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/', createTransactionValidation, addTransaction);

// @route   GET /api/transactions
// @desc    Get all transactions for the logged-in user (with filters)
// @access  Private
router.get('/', getTransactions);

// @route   GET /api/transactions/:id
// @desc    Get a single transaction by ID
// @access  Private
router.get('/:id', getTransactionById);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', createTransactionValidation, updateTransaction); // Use same or similar validation

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', deleteTransaction);

export default router;