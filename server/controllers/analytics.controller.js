// server/controllers/analytics.controller.js
import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.model.js';
// import Category from '../models/Category.model.js'; // Not used in this file directly
import mongoose from 'mongoose';

// Helper to get date range for period
// MOVED AND EXPORTED:
export const getDateRange = (period, customStartDate, customEndDate) => {
    let startDate, endDate = new Date(); // Default end date to now

    if (period === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        return { startDate, endDate };
    }

    // Default endDate to end of today for most cases, unless period specific (like last_month)
    if (period !== 'last_month') {
        endDate.setHours(23, 59, 59, 999);
    }


    switch (period) {
        case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today
            break;
        case 'week': // Current week (assuming Monday as start)
            startDate = new Date();
            // Adjust to Monday of the current week
            const dayOfWeek = startDate.getDay(); // Sunday = 0, Monday = 1, ...
            const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
            startDate = new Date(startDate.setDate(diff));
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month': // Current month
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'last_month':
            const nowForLastMonth = new Date(); // Use a fresh 'now' to calculate previous month
            startDate = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth() - 1, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth(), 0); // Last day of previous month
            endDate.setHours(23,59,59,999);
            break;
        case 'year': // Current year
            startDate = new Date(endDate.getFullYear(), 0, 1);
            startDate.setHours(0,0,0,0);
            break;
        default: // Default to current month if period is invalid or not 'custom'
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            startDate.setHours(0,0,0,0);
            break;
    }
    return { startDate, endDate };
};


/**
 * @desc    Get summary data for dashboard cards
 * @route   GET /api/analytics/dashboard-summary
 * @access  Private
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
    // ... (rest of the function remains the same, it will use the exported getDateRange)
    const userId = req.user._id;
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd); // Now uses the exported one

    const incomePromise = Transaction.aggregate([
        { $match: { user: userId, type: 'income', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
// ... rest of the function
    const expensePromise = Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [incomeResult, expenseResult] = await Promise.all([incomePromise, expensePromise]);

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const currentBalance = totalIncome - totalExpense;

    res.json({
        totalIncome,
        totalExpense,
        currentBalance,
        period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    });
});


/**
 * @desc    Get spending breakdown by category for a period
 * @route   GET /api/analytics/category-spending
 * @access  Private
 */
const getCategorySpending = asyncHandler(async (req, res) => {
    // ... (rest of the function remains the same)
    const userId = req.user._id;
    const { period = 'month', startDate: customStart, endDate: customEnd, limit = 7 } = req.query;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const spendingByCategory = await Transaction.aggregate([
        // ... aggregation pipeline
        {
            $match: {
                user: userId,
                type: 'expense',
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$category',
                totalSpent: { $sum: '$amount' }
            }
        },
        {
            $lookup: { 
                from: 'categories', 
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        },
        {
            $unwind: '$categoryDetails' 
        },
        {
            $project: {
                _id: 0, 
                categoryId: '$categoryDetails._id',
                categoryName: '$categoryDetails.name',
                categoryIcon: '$categoryDetails.icon',
                categoryColor: '$categoryDetails.color',
                totalSpent: 1
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: parseInt(limit) || 7 }
    ]);
    res.json(spendingByCategory);
});


/**
 * @desc    Get daily/monthly income/expense trends
 * @route   GET /api/analytics/trends
 * @access  Private
 */
const getIncomeExpenseTrends = asyncHandler(async (req, res) => {
    // ... (rest of the function remains the same)
    const userId = req.user._id;
    const { type = 'expense', granularity = 'daily', period = 'month', startDate: customStart, endDate: customEnd } = req.query;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);
    // ... rest of aggregation
    let dateFormat;
    if (granularity === 'daily') {
        dateFormat = "%Y-%m-%d";
    } else if (granularity === 'monthly') {
        dateFormat = "%Y-%m";
    } else if (granularity === 'yearly') {
        dateFormat = "%Y";
    } else {
        res.status(400);
        throw new Error("Invalid granularity. Choose 'daily', 'monthly', or 'yearly'.");
    }

    const matchStage = {
        user: userId,
        date: { $gte: startDate, $lte: endDate }
    };
    if (type === 'income' || type === 'expense') {
        matchStage.type = type;
    }


    let aggregationPipeline = [
        { $match: matchStage },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: dateFormat, date: "$date" } },
                },
                totalAmount: { $sum: "$amount" }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id.date",
                amount: "$totalAmount"
            }
        },
        { $sort: { date: 1 } } 
    ];

    if (type === 'balance') {
        aggregationPipeline = [
            { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$date" } },
                    totalIncome: {
                        $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                    },
                    totalExpense: {
                        $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    amount: { $subtract: ["$totalIncome", "$totalExpense"] }
                }
            },
            { $sort: { date: 1 } }
        ];
    }
    const trends = await Transaction.aggregate(aggregationPipeline);
    res.json(trends);
});

/**
 * @desc    Get savings vs. income ratio for a period
 * @route   GET /api/analytics/savings-ratio
 * @access  Private
 */
const getSavingsRatio = asyncHandler(async (req, res) => {
    // ... (rest of the function remains the same)
    const userId = req.user._id;
    const { period = 'month', startDate: customStart, endDate: customEnd } = req.query;

    const { startDate, endDate } = getDateRange(period, customStart, customEnd);

    const totals = await Transaction.aggregate([
        // ... aggregation
        {
            $match: {
                user: userId,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: "$type", 
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);
    // ... rest of logic
    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach(item => {
        if (item._id === 'income') {
            totalIncome = item.totalAmount;
        } else if (item._id === 'expense') {
            totalExpense = item.totalAmount;
        }
    });

    const savings = totalIncome - totalExpense;
    const savingsRatio = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : (totalExpense > 0 ? 100 : 0);


    res.json({
        totalIncome,
        totalExpense,
        savings,
        savingsRatio: parseFloat(savingsRatio.toFixed(2)),
        expenseRatio: parseFloat(expenseRatio.toFixed(2)),
        period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    });
});

// EXPORT ALL CONTROLLER FUNCTIONS
export {
  getDashboardSummary,
  getCategorySpending,
  getIncomeExpenseTrends,
  getSavingsRatio,
  // getDateRange is already exported at the top
};