import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPredefinedCategories,
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { createCategoryValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// @route   GET /api/categories/predefined
// @desc    Get all predefined categories
// @access  Public or Private (depends on if users need to be logged in to see them)
// Making it public for now, useful for signup or initial setup display.
router.get('/predefined', getPredefinedCategories);

// All subsequent routes are protected
router.use(protect);

// @route   POST /api/categories
// @desc    Create a new custom category
// @access  Private
router.post('/', createCategoryValidation, createCategory);

// @route   GET /api/categories
// @desc    Get all categories for the logged-in user (custom + relevant predefined)
// @access  Private
router.get('/', getCategories);

// @route   GET /api/categories/:id
// @desc    Get a single category by ID (ensure user owns it if not predefined)
// @access  Private
router.get('/:id', getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Update a custom category (predefined ones should not be updatable by users)
// @access  Private
router.put('/:id', createCategoryValidation, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete a custom category (predefined ones should not be deletable)
// @access  Private
router.delete('/:id', deleteCategory);

export default router;