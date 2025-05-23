// server/services/scheduler.service.js
import cron from 'node-cron';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js'; // Used for $lookup
import { sendDailyExpenseReport, sendMonthlyOverviewReport } from './email.service.js';
// import { getDateRange } from '../controllers/analytics.controller.js'; // Not strictly needed for fixed "yesterday" logic here
import colors from 'colors';

// --- Daily Expense Report Job (Runs daily, e.g., at 12:13 AM server time for previous day's report) ---
const scheduleDailyReport = () => {
  // Cron expression: 'minute hour day-of-month month day-of-week'
  // '13 0 * * *' means: at 13th minute past midnight (12:13 AM)
  cron.schedule('21 0 * * *', asyncHandler(async () => {
    console.log('Running daily expense report job for YESTERDAY\'s expenses...'.cyan);

    // Determine the date for "yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Set date to one day before the current date

    // Define the start and end of "yesterday"
    const startDate = new Date(yesterday);
    startDate.setHours(0, 0, 0, 0); // Beginning of yesterday

    const endDate = new Date(yesterday);
    endDate.setHours(23, 59, 59, 999); // End of yesterday

    console.log(`Fetching daily expenses for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`.gray);

    const users = await User.find({ 'emailPreferences.dailyReport': true, email: { $ne: null } });

    for (const user of users) {
      try {
        const expensesForYesterday = await Transaction.aggregate([
          {
            $match: {
              user: user._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate } // Query for transactions within yesterday's range
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
              from: 'categories', // The actual name of your categories collection in MongoDB
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDetails'
            }
          },
          {
            // $unwind to deconstruct the categoryDetails array.
            // preserveNullAndEmptyArrays: true ensures that if a category ID in a transaction
            // doesn't match any category (e.g., category was deleted), the transaction isn't lost.
            $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true }
          },
          {
            $project: {
              _id: 0, // Exclude the original _id (which is category ObjectId)
              categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] }, // Handle if categoryDetails is null
              totalSpent: 1
            }
          },
          { $sort: { totalSpent: -1 } }
        ]);

        const totalSpentForReportDate = expensesForYesterday.reduce((sum, item) => sum + item.totalSpent, 0);

        const reportData = {
          totalSpentToday: totalSpentForReportDate, // Variable name in email template might say "Today"
          expensesByCategory: expensesForYesterday,
          date: yesterday.toISOString(), // Pass the actual date the report is for
        };

        if (user.email) {
            await sendDailyExpenseReport(user, reportData); // This function expects 'totalSpentToday'
            console.log(`Daily report sent to ${user.email} for expenses of ${yesterday.toLocaleDateString()}`.green);
        } else {
            console.warn(`User ${user._id} has daily reports enabled but no email address.`.yellow);
        }

      } catch (error) {
        console.error(`Failed to generate or send daily report to ${user.email} for ${yesterday.toLocaleDateString()}: ${error.message}`.red);
        console.error(error.stack);
      }
    }
    console.log('Daily expense report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: "Asia/Kolkata" // IMPORTANT: Set to your target user's timezone.
                             // This ensures 12:13 AM is 12:13 AM in Kolkata.
  });
};


// --- Monthly Overview Report Job (Runs on the 1st of each month at 9 AM server time) ---
const scheduleMonthlyReport = () => {
  cron.schedule('0 9 1 * *', asyncHandler(async () => { // 9:00 AM on the 1st day of the month
    console.log('Running monthly overview report job for PREVIOUS month...'.cyan);

    const now = new Date(); // Date when the job runs (e.g., May 1st)
    // We want the report for the *previous* month (e.g., April)

    const prevMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    prevMonthEndDate.setHours(23, 59, 59, 999);

    const prevMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
    prevMonthStartDate.setHours(0, 0, 0, 0);

    const monthName = prevMonthStartDate.toLocaleString('default', { month: 'long' });
    const year = prevMonthStartDate.getFullYear();

    console.log(`Fetching monthly overview for date range: ${prevMonthStartDate.toISOString()} to ${prevMonthEndDate.toISOString()}`.gray);


    const users = await User.find({ 'emailPreferences.monthlyReport': true, email: { $ne: null } });

    for (const user of users) {
      try {
        const incomePromise = Transaction.aggregate([
          { $match: { user: user._id, type: 'income', date: { $gte: prevMonthStartDate, $lte: prevMonthEndDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const expensePromise = Transaction.aggregate([
          { $match: { user: user._id, type: 'expense', date: { $gte: prevMonthStartDate, $lte: prevMonthEndDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const topSpendingPromise = Transaction.aggregate([
          { $match: { user: user._id, type: 'expense', date: { $gte: prevMonthStartDate, $lte: prevMonthEndDate } } },
          { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
          { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] }, totalSpent: 1 } },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 }
        ]);

        const [incomeResult, expenseResult, topSpendingCategories] = await Promise.all([
            incomePromise, expensePromise, topSpendingPromise
        ]);

        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const netSavings = totalIncome - totalExpense;

        let suggestions = [];
        if (totalExpense > totalIncome) {
          suggestions.push("You spent more than you earned last month. Try to identify areas to cut back.");
        }
        if (topSpendingCategories.length > 0 && topSpendingCategories[0].totalSpent > (totalExpense * 0.3) ) {
            suggestions.push(`Your spending on "${topSpendingCategories[0].categoryName}" was significant. See if there are ways to optimize it.`);
        }
        if (netSavings > 0) {
            suggestions.push(`Great job saving ₹${netSavings.toFixed(2)}! Consider allocating some of it towards your financial goals.`);
        }

        const reportData = {
          monthName,
          year,
          totalIncome,
          totalExpense,
          netSavings,
          topSpendingCategories,
          suggestions,
        };
        
        if (user.email) {
            await sendMonthlyOverviewReport(user, reportData);
            console.log(`Monthly overview sent to ${user.email} for ${monthName} ${year}`.green);
        } else {
            console.warn(`User ${user._id} has monthly reports enabled but no email address.`.yellow);
        }

      } catch (error) {
        console.error(`Failed to generate or send monthly overview to ${user.email} for ${monthName} ${year}: ${error.message}`.red);
        console.error(error.stack);
      }
    }
    console.log('Monthly overview report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};


// --- Initialize all schedulers ---
export const initializeScheduler = () => {
  if (process.env.NODE_ENV !== 'test') { // Don't run schedulers during tests
    scheduleDailyReport();
    scheduleMonthlyReport();
    console.log('Cron jobs initialized.'.magenta);
  } else {
    console.log('Cron jobs skipped in test environment.'.gray);
  }
};