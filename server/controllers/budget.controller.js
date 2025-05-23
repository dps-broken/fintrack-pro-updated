import asyncHandler from 'express-async-handler';
import Budget from '../models/Budget.model.js';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res) => {
  const { name, category: categoryId, amount, period, startDate, endDate, notificationsEnabled } = req.body;

  if (!name || !amount || !period || !startDate) {
    res.status(400);
    throw new Error('Budget name, amount, period, and start date are required.');
  }

  if (categoryId) {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists || categoryExists.type !== 'expense') { // Budgets usually for expenses
      res.status(400);
      throw new Error('Invalid category selected or category is not an expense type.');
    }
  }

  // Basic validation for overlapping budgets (can be more complex)
  const query = {
    user: req.user._id,
    period,
    // This overlap check is simplified. Real overlap detection needs careful date range logic.
    // $or: [ { category: categoryId }, { category: null } ] // if global and specific can't overlap same period
  };
  if (categoryId) query.category = categoryId;
  else query.category = null; // Global budget

  // For a robust overlap check, you'd compare startDate and endDate ranges.
  // Example: check if another budget exists where its start is before new one's end, AND its end is after new one's start.
  // For simplicity, we'll allow multiple budgets for now and rely on user management.

  const budget = await Budget.create({
    user: req.user._id,
    name,
    category: categoryId || null,
    amount: parseFloat(amount),
    period,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true,
  });

  res.status(201).json(budget);
});

/**
 * @desc    Get all budgets for the logged-in user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res) => {
  const { period, category: categoryId, active } = req.query; // 'active' means current period
  const query = { user: req.user._id };

  if (period) query.period = period;
  if (categoryId) query.category = categoryId;

  if (active === 'true') {
    const now = new Date();
    // This active filter is basic. For 'monthly', it might mean startDate is within current month.
    // For 'custom', it means now is between startDate and endDate.
    query.startDate = { $lte: now };
    // query.$or = [ { endDate: null }, { endDate: { $gte: now } } ]; // Needs refinement
  }

  const budgets = await Budget.find(query)
    .populate('category', 'name icon color')
    .sort({ startDate: -1 });


  // Enhance budgets with current spending
  const budgetsWithStatus = await Promise.all(
    budgets.map(async (budget) => {
      const { totalSpent, progress } = await calculateBudgetSpending(budget, req.user._id);
      return { ...budget.toObject(), totalSpent, progress };
    })
  );


  res.json(budgetsWithStatus);
});

// Helper function to calculate spending for a budget
const calculateBudgetSpending = async (budget, userId) => {
    const budgetStartDate = new Date(budget.startDate);
    let budgetEndDate;

    if (budget.period === 'monthly') {
        budgetEndDate = new Date(budgetStartDate);
        budgetEndDate.setMonth(budgetStartDate.getMonth() + 1);
        budgetEndDate.setDate(0); // Last day of the budget's start month
        budgetEndDate.setHours(23, 59, 59, 999);
    } else if (budget.period === 'yearly') {
        budgetEndDate = new Date(budgetStartDate);
        budgetEndDate.setFullYear(budgetStartDate.getFullYear() + 1);
        budgetEndDate.setDate(0);
        budgetEndDate.setHours(23, 59, 59, 999);
    } else if (budget.period === 'custom' && budget.endDate) {
        budgetEndDate = new Date(budget.endDate);
        budgetEndDate.setHours(23, 59, 59, 999);
    } else { // Default to a month if end date is problematic
        budgetEndDate = new Date(budgetStartDate);
        budgetEndDate.setMonth(budgetStartDate.getMonth() + 1);
        budgetEndDate.setDate(0);
        budgetEndDate.setHours(23, 59, 59, 999);
    }


    const spendingQuery = {
        user: userId,
        type: 'expense',
        date: { $gte: budgetStartDate, $lte: budgetEndDate },
    };

    if (budget.category) { // If it's a category-specific budget
        spendingQuery.category = budget.category._id || budget.category; // budget.category might be object or ID
    }

    const spentAggregation = await Transaction.aggregate([
        { $match: spendingQuery },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
    ]);

    const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].totalSpent : 0;
    const progress = budget.amount > 0 ? Math.min(100, (totalSpent / budget.amount) * 100) : 0;

    return { totalSpent, progress: parseFloat(progress.toFixed(2)) };
};


/**
 * @desc    Get consumption status for a specific budget
 * @route   GET /api/budgets/:id/status
 * @access  Private
 */
const getBudgetStatus = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid budget ID format');
    }
    const budget = await Budget.findById(req.params.id);

    if (budget && budget.user.toString() === req.user._id.toString()) {
        const { totalSpent, progress } = await calculateBudgetSpending(budget, req.user._id);
        res.json({
            budgetId: budget._id,
            name: budget.name,
            amount: budget.amount,
            totalSpent,
            progress,
            remaining: budget.amount - totalSpent,
        });
    } else {
        res.status(404);
        throw new Error('Budget not found or not authorized');
    }
});


/**
 * @desc    Get a single budget by ID
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid budget ID format');
  }
  const budget = await Budget.findById(req.params.id).populate('category', 'name icon color');

  if (budget && budget.user.toString() === req.user._id.toString()) {
    const { totalSpent, progress } = await calculateBudgetSpending(budget, req.user._id);
    res.json({ ...budget.toObject(), totalSpent, progress });
  } else {
    res.status(404);
    throw new Error('Budget not found or not authorized');
  }
});

/**
 * @desc    Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid budget ID format');
  }
  const budget = await Budget.findById(req.params.id);

  if (budget && budget.user.toString() === req.user._id.toString()) {
    const { name, category: categoryId, amount, period, startDate, endDate, notificationsEnabled } = req.body;

    if (categoryId !== undefined) { // if category is part of update
        if (categoryId === null) { // Setting to global budget
            budget.category = null;
        } else {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists || categoryExists.type !== 'expense') {
                res.status(400);
                throw new Error('Invalid category for update or category is not an expense type.');
            }
            budget.category = categoryId;
        }
    }

    budget.name = name || budget.name;
    budget.amount = amount !== undefined ? parseFloat(amount) : budget.amount;
    budget.period = period || budget.period;
    budget.startDate = startDate ? new Date(startDate) : budget.startDate;
    budget.endDate = endDate !== undefined ? (endDate ? new Date(endDate) : null) : budget.endDate;
    budget.notificationsEnabled = notificationsEnabled !== undefined ? notificationsEnabled : budget.notificationsEnabled;


    const updatedBudget = await budget.save();
    const { totalSpent, progress } = await calculateBudgetSpending(updatedBudget, req.user._id);
    res.json({ ...updatedBudget.toObject(), totalSpent, progress });
  } else {
    res.status(404);
    throw new Error('Budget not found or not authorized');
  }
});

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid budget ID format');
  }
  const budget = await Budget.findById(req.params.id);

  if (budget && budget.user.toString() === req.user._id.toString()) {
    await Budget.deleteOne({_id: budget._id});
    res.json({ message: 'Budget removed' });
  } else {
    res.status(404);
    throw new Error('Budget not found or not authorized');
  }
});

export {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
};