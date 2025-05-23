import asyncHandler from 'express-async-handler';
import Category from '../models/Category.model.js';
import Transaction from '../models/Transaction.model.js'; // To check for usage before deletion
import mongoose from 'mongoose';

// Seed some predefined categories (call this once, e.g. in a seeder script or app startup)
// For simplicity, this function could be moved to a seeder.js file
const PREDEFINED_CATEGORIES = [
    // Expenses
    { name: 'Food', type: 'expense', icon: 'FaUtensils', color: '#FF6384', isPredefined: true },
    { name: 'Groceries', type: 'expense', icon: 'FaShoppingCart', color: '#FF9F40', isPredefined: true },
    { name: 'Travel', type: 'expense', icon: 'FaCar', color: '#FFCD56', isPredefined: true },
    { name: 'Housing', type: 'expense', icon: 'FaHome', color: '#4BC0C0', isPredefined: true },
    { name: 'Utilities', type: 'expense', icon: 'FaLightbulb', color: '#36A2EB', isPredefined: true },
    { name: 'Entertainment', type: 'expense', icon: 'FaFilm', color: '#9966FF', isPredefined: true },
    { name: 'Healthcare', type: 'expense', icon: 'FaBriefcaseMedical', color: '#C9CBCF', isPredefined: true },
    { name: 'Shopping', type: 'expense', icon: 'FaShoppingBag', color: '#F7464A', isPredefined: true },
    { name: 'Education', type: 'expense', icon: 'FaBook', color: '#46BFBD', isPredefined: true },
    { name: 'Gifts', type: 'expense', icon: 'FaGift', color: '#FDB45C', isPredefined: true },
    { name: 'Smoking', type: 'expense', icon: 'FaSmoking', color: '#808080', isPredefined: true }, // As requested
    { name: 'Room Items', type: 'expense', icon: 'FaBed', color: '#A0522D', isPredefined: true }, // As requested
    { name: 'Other Expense', type: 'expense', icon: 'FaQuestionCircle', color: '#6c757d', isPredefined: true },

    // Income
    { name: 'Salary', type: 'income', icon: 'FaMoneyBillWave', color: '#4CAF50', isPredefined: true },
    { name: 'Freelance', type: 'income', icon: 'FaLaptopCode', color: '#8BC34A', isPredefined: true },
    { name: 'Investment', type: 'income', icon: 'FaChartLine', color: '#CDDC39', isPredefined: true },
    { name: 'Gifts Received', type: 'income', icon: 'FaGift', color: '#FFEB3B', isPredefined: true },
    { name: 'Cashback', type: 'income', icon: 'FaUndo', color: '#FFC107', isPredefined: true }, // As requested
    { name: 'Friend', type: 'income', icon: 'FaUserFriends', color: '#FF9800', isPredefined: true }, // As requested
    { name: 'Other Income', type: 'income', icon: 'FaPlusCircle', color: '#009688', isPredefined: true },
];

export const seedPredefinedCategories = asyncHandler(async () => {
    // Check if predefined categories already exist to avoid duplicates
    for (const cat of PREDEFINED_CATEGORIES) {
        const existing = await Category.findOne({ name: cat.name, type: cat.type, isPredefined: true });
        if (!existing) {
            await Category.create(cat);
            console.log(`Seeded category: ${cat.name}`.green);
        }
    }
});

// Call it once if needed (e.g., on first server start or via a specific route/script)
// seedPredefinedCategories(); // Better to run this via a seeder script: `node seeder.js`


/**
 * @desc    Get all predefined categories
 * @route   GET /api/categories/predefined
 * @access  Public (or Private)
 */
const getPredefinedCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isPredefined: true }).sort({ type: 1, name: 1});
    res.json(categories);
});


/**
 * @desc    Create a new custom category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, icon, color } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Category name and type are required.');
  }
  if (!['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error('Invalid category type. Must be "income" or "expense".');
  }

  // Check if a custom category with the same name and type already exists for this user
  const existingCategory = await Category.findOne({
    user: req.user._id,
    name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive match
    type,
  });

  if (existingCategory) {
    res.status(400);
    throw new Error(`You already have a custom ${type} category named "${name}".`);
  }
  // Also check predefined
  const existingPredefined = await Category.findOne({
    isPredefined: true,
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    type,
  });
  if (existingPredefined) {
    res.status(400);
    throw new Error(`A predefined ${type} category named "${name}" already exists. Choose a different name.`);
  }


  const category = await Category.create({
    user: req.user._id,
    name,
    type,
    icon: icon || (type === 'income' ? 'FaPlusCircle' : 'FaQuestionCircle'), // Default icons
    color: color || '#CCCCCC',
    isPredefined: false,
  });

  res.status(201).json(category);
});

/**
 * @desc    Get all categories for the logged-in user (custom + predefined)
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query; // Optional filter by type (income/expense)

  const query = {
    $or: [{ user: req.user._id }, { isPredefined: true }],
  };

  if (type && ['income', 'expense'].includes(type)) {
    query.type = type;
  }

  const categories = await Category.find(query).sort({ type: 1, isPredefined: -1, name: 1 });
  res.json(categories);
});

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Private
 */
const getCategoryById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid category ID format');
  }
  const category = await Category.findById(req.params.id);

  if (category) {
    // User can access their own custom categories or any predefined category
    if (category.isPredefined || (category.user && category.user.toString() === req.user._id.toString())) {
      res.json(category);
    } else {
      res.status(403); // Forbidden
      throw new Error('Not authorized to access this category');
    }
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

/**
 * @desc    Update a custom category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid category ID format');
  }
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (category.isPredefined) {
    res.status(400);
    throw new Error('Predefined categories cannot be modified.');
  }

  if (category.user.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden
    throw new Error('Not authorized to update this category');
  }

  const { name, icon, color } = req.body;

  // Check for name conflict if name is being changed
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        type: category.type, // Type cannot be changed
        _id: { $ne: category._id } // Exclude current category from check
    });
    if (existingCategory) {
        res.status(400);
        throw new Error(`You already have another custom ${category.type} category named "${name}".`);
    }
    const existingPredefined = await Category.findOne({
        isPredefined: true,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        type: category.type,
    });
    if (existingPredefined) {
        res.status(400);
        throw new Error(`A predefined ${category.type} category named "${name}" already exists.`);
    }
    category.name = name;
  }

  category.icon = icon !== undefined ? icon : category.icon;
  category.color = color !== undefined ? color : category.color;
  // Category type (income/expense) should generally not be updatable once created
  // as it might mess up existing transactions.

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

/**
 * @desc    Delete a custom category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid category ID format');
  }
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (category.isPredefined) {
    res.status(400);
    throw new Error('Predefined categories cannot be deleted.');
  }

  if (category.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this category');
  }

  // Check if the category is in use by any transactions
  const transactionsUsingCategory = await Transaction.findOne({ category: category._id, user: req.user._id });
  if (transactionsUsingCategory) {
    res.status(400);
    throw new Error(
      'This category is currently in use by one or more transactions. Please re-categorize those transactions or delete them first.'
    );
  }
  // Also check budgets if they can be linked to categories
  // const budgetsUsingCategory = await Budget.findOne({ category: category._id, user: req.user._id });
  // if (budgetsUsingCategory) {
  //   res.status(400);
  //   throw new Error('This category is used in a budget. Please update or delete the budget first.');
  // }


  await Category.deleteOne({ _id: category._id }); // Mongoose 8+
  res.json({ message: 'Category removed' });
});

export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getPredefinedCategories,
};