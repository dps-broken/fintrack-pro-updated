// server/services/scheduler.service.js
import cron from 'node-cron';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js';
import { sendDailyExpenseReport, sendMonthlyOverviewReport } from './email.service.js';
import { getDateRange } from '../controllers/analytics.controller.js'; // Assuming this is correctly exported
import colors from 'colors'; // Ensure colors is available if you use .cyan etc.

// --- Daily Expense Report Job (Runs daily at 12:20 AM server time) ---
const scheduleDailyReport = () => {
  // Cron expression: 'minute hour day-of-month month day-of-week'
  // '20 0 * * *' means: at the 20th minute, of the 0th hour (midnight), every day, every month, every day of week.
  cron.schedule('20 0 * * *', asyncHandler(async () => { // <<<<----- UPDATED SCHEDULE
    console.log('Running daily expense report job at 12:20 AM...'.cyan);
    const today = new Date(); // This will be the date when the job runs (just after midnight)
                           // So it will correctly pick up expenses for the *previous* full day.
    
    // To get expenses for the *previous* day when running at 12:20 AM:
    const reportDate = new Date(today);
    reportDate.setDate(today.getDate() - 1); // Set to yesterday

    const startDate = new Date(reportDate);
    startDate.setHours(0, 0, 0, 0); // Start of yesterday

    const endDate = new Date(reportDate);
    endDate.setHours(23, 59, 59, 999); // End of yesterday

    console.log(`Fetching expenses for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`.gray);


    const users = await User.find({ 'emailPreferences.dailyReport': true, email: { $ne: null } });

    for (const user of users) {
      try {
        const expensesToday = await Transaction.aggregate([
          {
            $match: {
              user: user._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate } // Use the calculated startDate and endDate for yesterday
            }
          },
          {
            $group: {
              _id: '$category',
              totalSpent: { $sum: '$amount' }
            }
          },
          {
            $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' }
          },
          { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } }, // Preserve if category somehow deleted
          {
            $project: {
              _id: 0,
              categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] },
              totalSpent: 1
            }
          },
          { $sort: { totalSpent: -1 } }
        ]);

        const totalSpentForReportDate = expensesToday.reduce((sum, item) => sum + item.totalSpent, 0);

        const reportData = {
          totalSpentToday: totalSpentForReportDate,
          expensesByCategory: expensesToday,
          date: reportDate.toISOString(), // Use the actual date the report is for
        };

        if (user.email) { // Double check user has an email before attempting to send
            await sendDailyExpenseReport(user, reportData);
            console.log(`Daily report sent to ${user.email} for date ${reportDate.toLocaleDateString()}`.green);
        } else {
            console.warn(`User ${user._id} has daily reports enabled but no email address.`.yellow);
        }

      } catch (error) {
        console.error(`Failed to generate or send daily report to ${user.email}: ${error.message}`.red);
        console.error(error.stack); // Log stack for more details
      }
    }
    console.log('Daily expense report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: "Asia/Kolkata" // IMPORTANT: Set this to your desired timezone
                             // e.g., "America/New_York", "Europe/London"
                             // If not set, it uses the server's local timezone.
  });
};


// --- Monthly Overview Report Job (Runs on the 1st of each month at 9 AM server time) ---
const scheduleMonthlyReport = () => {
  cron.schedule('0 9 1 * *', asyncHandler(async () => {
    console.log('Running monthly overview report job (1st of month at 9:00 AM)...'.cyan);

    const now = new Date();
    // Report for the *previous* month
    const prevMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    prevMonthEndDate.setHours(23, 59, 59, 999);

    const monthName = prevMonthStartDate.toLocaleString('default', { month: 'long' });
    const year = prevMonthStartDate.getFullYear();

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
        // ... (your suggestions logic) ...
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
        console.error(`Failed to generate or send monthly overview to ${user.email}: ${error.message}`.red);
        console.error(error.stack);
      }
    }
    console.log('Monthly overview report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: "Asia/Kolkata" // Match daily report timezone or set as needed
  });
};


// --- Initialize all schedulers ---
export const initializeScheduler = () => {
  if (process.env.NODE_ENV !== 'test') {
    scheduleDailyReport();
    scheduleMonthlyReport();
    console.log('Cron jobs initialized.'.magenta);
  } else {
    console.log('Cron jobs skipped in test environment.'.gray);
  }
};