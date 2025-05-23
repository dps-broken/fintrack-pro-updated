import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js';
import Budget from '../models/Budget.model.js'; // For budget notifications
import { sendBudgetBreachAlert } from '../services/email.service.js'; // For email notifications
import User from '../models/User.model.js'; // For user preferences
import mongoose from 'mongoose';

// Helper function to check and send budget notifications
const checkAndNotifyBudgetBreach = async (userId, transaction) => {
    if (transaction.type !== 'expense') return;

    const user = await User.findById(userId).select('emailPreferences email');
    if (!user || !user.emailPreferences.budgetAlerts) return;

    // Find budgets relevant to this transaction's category and date
    const transactionDate = new Date(transaction.date);
    const budgets = await Budget.find({
        user: userId,
        $or: [
            { category: transaction.category }, // Category specific budget
            { category: null } // Global budget
        ],
        period: 'monthly', // Assuming monthly for simplicity, expand for others
        startDate: { $lte: transactionDate },
        // endDate needs careful handling for monthly/yearly
    }).populate('category');

    for (const budget of budgets) {
        // Calculate current spending for this budget's period and category
        const budgetStartDate = new Date(budget.startDate);
        let budgetEndDate;

        if (budget.period === 'monthly') {
            budgetEndDate = new Date(budgetStartDate);
            budgetEndDate.setMonth(budgetStartDate.getMonth() + 1);
            budgetEndDate.setDate(0); // Last day of the budget's start month
        } else if (budget.period === 'yearly') {
            // ... handle yearly
        } else if (budget.period === 'custom' && budget.endDate) {
            budgetEndDate = new Date(budget.endDate);
        } else {
            continue; // Skip if period is not handled or endDate is missing for custom
        }
         budgetEndDate.setHours(23, 59, 59, 999); // Ensure end of day

        if (transactionDate > budgetEndDate) continue; // Transaction outside budget period


        const spendingQuery = {
            user: userId,
            type: 'expense',
            date: { $gte: budgetStartDate, $lte: budgetEndDate },
        };
        if (budget.category) { // If it's a category-specific budget
            spendingQuery.category = budget.category._id;
        }

        const spentAggregation = await Transaction.aggregate([
            { $match: spendingQuery },
            { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
        ]);
        const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].totalSpent : 0;

        // Check for breach (e.g., 80% and 100%)
        const usagePercentage = (totalSpent / budget.amount) * 100;

        // console.log(`Budget: ${budget.name}, Spent: ${totalSpent}, Amount: ${budget.amount}, Usage: ${usagePercentage}%`);


        // Basic notification logic (could be more sophisticated with tracking sent notifications)
        if (usagePercentage >= 80 && usagePercentage < 100 && !budget.notifiedAt80) { // Add notifiedAt80 to budget model if needed
            // Send 80% alert
            console.log(`Budget alert (80%): ${budget.name} for user ${userId}`);
            if(user.emailPreferences.budgetAlerts) {
                sendBudgetBreachAlert(user, budget, totalSpent, 80);
            }
            // Budget.findByIdAndUpdate(budget._id, { notifiedAt80: true }); // Mark as notified
        } else if (usagePercentage >= 100 && !budget.notifiedAt100) { // Add notifiedAt100
            // Send 100% (breached) alert
            console.log(`Budget alert (100% BREACHED): ${budget.name} for user ${userId}`);
             if(user.emailPreferences.budgetAlerts) {
                sendBudgetBreachAlert(user, budget, totalSpent, 100);
            }
            // Budget.findByIdAndUpdate(budget._id, { notifiedAt100: true });
        }
    }
};


/**
 * @desc    Add a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const addTransaction = asyncHandler(async (req, res) => {
  const { type, amount, category, sourceDestination, date, notes } = req.body;

  if (!type || !amount || !category || !sourceDestination || !date) {
    res.status(400);
    throw new Error('Please provide all required fields: type, amount, category, source/destination, and date.');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error('Invalid category selected.');
  }
  // Ensure category type matches transaction type
  if (categoryExists.type !== type) {
    res.status(400);
    throw new Error(`Category "${categoryExists.name}" is for ${categoryExists.type}, but transaction type is ${type}.`);
  }


  // Auto-tagging (basic example - can be expanded)
  let finalCategory = category;
  // TODO: Implement more sophisticated auto-tagging based on sourceDestination
  // For example, query user's frequent merchants or a global map
  // if (sourceDestination.toLowerCase().includes('swiggy') || sourceDestination.toLowerCase().includes('zomato')) {
  //   const foodCategory = await Category.findOne({ name: 'Food', type: 'expense', $or: [{user: req.user._id}, {isPredefined: true}] });
  //   if (foodCategory) finalCategory = foodCategory._id;
  // }

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount: parseFloat(amount),
    category: finalCategory,
    sourceDestination,
    date: new Date(date),
    notes,
  });

  if (transaction) {
    // Check for budget breach after adding expense
    if (transaction.type === 'expense') {
      await checkAndNotifyBudgetBreach(req.user._id, transaction);
    }
    res.status(201).json(transaction);
  } else {
    res.status(400);
    throw new Error('Invalid transaction data');
  }
});

/**
 * @desc    Get all transactions for the logged-in user (with filters and sorting)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'date',
    order = 'desc',
    type,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search, // For sourceDestination or notes
  } = req.query;

  const query = { user: req.user._id };

  if (type) query.type = type;
  if (category) query.category = category; // Assuming category is an ID
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999); // Ensure end of day
        query.date.$lte = endOfDay;
    }
  }
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
  }
  if (search) {
    query.$or = [
        { sourceDestination: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
    ];
  }


  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;
  if (sortBy !== 'date') sortOptions.date = -1; // Secondary sort by date

  const transactions = await Transaction.find(query)
    .populate('category', 'name icon color type') // Populate category details
    .sort(sortOptions)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  const totalTransactions = await Transaction.countDocuments(query);

  res.json({
    transactions,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalTransactions / parseInt(limit)),
    totalTransactions,
  });
});

/**
 * @desc    Get a single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid transaction ID format');
  }
  const transaction = await Transaction.findById(req.params.id).populate('category', 'name icon color type');

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found or not authorized');
  }
});

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid transaction ID format');
  }
  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    const { type, amount, category, sourceDestination, date, notes } = req.body;

    // Validate category if provided
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            res.status(400);
            throw new Error('Invalid category selected for update.');
        }
        // Ensure category type matches transaction type if type is also being updated or remains same
        const newType = type || transaction.type;
        if (categoryExists.type !== newType) {
          res.status(400);
          throw new Error(`Category "${categoryExists.name}" is for ${categoryExists.type}, but transaction type is ${newType}.`);
        }
        transaction.category = category;
    }


    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? parseFloat(amount) : transaction.amount;
    transaction.sourceDestination = sourceDestination || transaction.sourceDestination;
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.notes = notes !== undefined ? notes : transaction.notes; // Allow empty string for notes

    const updatedTransaction = await transaction.save();

    // Re-check budget breach if an expense was modified
    if (updatedTransaction.type === 'expense') {
        await checkAndNotifyBudgetBreach(req.user._id, updatedTransaction);
    }

    res.json(updatedTransaction);
  } else {
    res.status(404);
    throw new Error('Transaction not found or not authorized');
  }
});

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid transaction ID format');
  }
  const transaction = await Transaction.findById(req.params.id);

  if (transaction && transaction.user.toString() === req.user._id.toString()) {
    await Transaction.deleteOne({ _id: req.params.id }); // Mongoose 8+
    // or await transaction.remove(); for older Mongoose
    res.json({ message: 'Transaction removed' });
  } else {
    res.status(404);
    throw new Error('Transaction not found or not authorized');
  }
});

export {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};