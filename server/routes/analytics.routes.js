import express from 'express';
import {
  getCategorySpending,
  getIncomeExpenseTrends,
  getSavingsRatio,
  getDashboardSummary, // For dashboard cards
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/analytics/dashboard-summary
// @desc    Get summary data for dashboard cards (total income, expense, balance this month)
// @access  Private
router.get('/dashboard-summary', getDashboardSummary);

// @route   GET /api/analytics/category-spending
// @desc    Get spending breakdown by category for a period
// @access  Private
router.get('/category-spending', getCategorySpending); // Expects query params like ?period=month&startDate=&endDate=

// @route   GET /api/analytics/trends
// @desc    Get daily/monthly income/expense trends
// @access  Private
router.get('/trends', getIncomeExpenseTrends); // Expects query params like ?type=expense&period=monthly&granularity=daily

// @route   GET /api/analytics/savings-ratio
// @desc    Get savings vs. income ratio for a period
// @access  Private
router.get('/savings-ratio', getSavingsRatio); // Expects query params like ?period=month&startDate=&endDate=


export default router;