// server/services/scheduler.service.js
import cron from 'node-cron';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js';
import { sendDailyExpenseReport, sendMonthlyOverviewReport } from './email.service.js';
import moment from 'moment-timezone'; // Import moment-timezone
import colors from 'colors';

const TARGET_TIMEZONE = "Asia/Kolkata"; // Define your target timezone

// --- Daily Expense Report Job ---
const scheduleDailyReport = () => {
  // Cron expression: 'minute hour day-of-month month day-of-week'
  // e.g., '13 0 * * *' for 12:13 AM in TARGET_TIMEZONE
  cron.schedule('47 0 * * *', asyncHandler(async () => {
    const jobRunTimeMoment = moment.tz(TARGET_TIMEZONE); // Current time in target timezone when job starts
    console.log(`[CRON START] Daily report job initiated at: ${jobRunTimeMoment.format('YYYY-MM-DD HH:mm:ss Z')} (${TARGET_TIMEZONE})`.cyan);

    // Determine "yesterday" in the TARGET_TIMEZONE
    const yesterdayMoment = jobRunTimeMoment.clone().subtract(1, 'day');

    // Define the start and end of "yesterday" in TARGET_TIMEZONE
    // These moments will then be converted to JS Date objects (which are UTC-based) for Mongoose
    // const startDate = yesterdayMoment.clone().startOf('day').toDate(); // 00:00:00 of yesterday in TARGET_TIMEZONE, converted to UTC Date
    // const endDate = yesterdayMoment.clone().endOf('day').toDate();     // 23:59:59.999 of yesterday in TARGET_TIMEZONE, converted to UTC Date



    // OLD
// const startDate = yesterdayMoment.clone().startOf('day').toDate();
// const endDate = yesterdayMoment.clone().endOf('day').toDate();

// NEW
const startDate = moment.tz(yesterdayMoment.format('YYYY-MM-DD'), TARGET_TIMEZONE).startOf('day').utc().toDate();
const endDate = moment.tz(yesterdayMoment.format('YYYY-MM-DD'), TARGET_TIMEZONE).endOf('day').utc().toDate();




    console.log(`[CRON DATE CALC] Reporting for date (in ${TARGET_TIMEZONE}): ${yesterdayMoment.format('YYYY-MM-DD')}`.magenta);
    console.log(`[CRON DATE CALC] Query Start (UTC for DB): ${startDate.toISOString()}`.magenta);
    console.log(`[CRON DATE CALC] Query End (UTC for DB): ${endDate.toISOString()}`.magenta);

    const users = await User.find({ 'emailPreferences.dailyReport': true, email: { $ne: null } });
    console.log(`[CRON INFO] Found ${users.length} users for daily report.`.gray);

    for (const user of users) {
      console.log(`[CRON USER] Processing user: ${user.email}`.blue);
      try {
        const expensesForYesterday = await Transaction.aggregate([
          {
            $match: {
              user: user._id,
              type: 'expense',
              date: { $gte: startDate, $lte: endDate } // Mongoose will handle these UTC dates correctly against its stored UTC dates
            }
          },
          { $group: { _id: '$category', totalSpent: { $sum: '$amount' }}},
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' }},
          { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true }},
          { $project: { _id: 0, categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] }, totalSpent: 1 }},
          { $sort: { totalSpent: -1 } }
        ]);

        const totalSpentForReportDate = expensesForYesterday.reduce((sum, item) => sum + item.totalSpent, 0);
        
        const reportData = {
          totalSpentToday: totalSpentForReportDate,
          expensesByCategory: expensesForYesterday,
          date: yesterdayMoment.toDate().toISOString(), // Date the report is *for*, in ISO string (UTC)
        };
        
        console.log(`[CRON USER REPORT DATA for ${user.email}] Date for report: ${new Date(reportData.date).toLocaleDateString('en-IN', {timeZone: TARGET_TIMEZONE})}, Total Spent: ${reportData.totalSpentToday}`.yellow);

        if (user.email) {
            await sendDailyExpenseReport(user, reportData);
            console.log(`Daily report sent to ${user.email} for expenses of ${yesterdayMoment.format('YYYY-MM-DD')}`.green);
        } else {
            console.warn(`User ${user._id} has daily reports enabled but no email address.`.yellow);
        }

      } catch (error) {
        console.error(`Failed to generate or send daily report to ${user.email} for ${yesterdayMoment.format('YYYY-MM-DD')}: ${error.message}`.red);
        console.error(error.stack);
      }
    }
    console.log('[CRON END] Daily expense report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: TARGET_TIMEZONE // node-cron uses this to determine *when* to trigger the job based on this timezone
  });
};


// --- Monthly Overview Report Job ---
const scheduleMonthlyReport = () => {
  cron.schedule('0 9 1 * *', asyncHandler(async () => { // 9:00 AM on 1st of month in TARGET_TIMEZONE
    const jobRunTimeMoment = moment.tz(TARGET_TIMEZONE);
    console.log(`[CRON START] Monthly overview job initiated at: ${jobRunTimeMoment.format('YYYY-MM-DD HH:mm:ss Z')} (${TARGET_TIMEZONE})`.cyan);

    // Report for the *previous* month, calculated in TARGET_TIMEZONE
    const prevMonthMoment = jobRunTimeMoment.clone().subtract(1, 'month');

    const prevMonthStartDate = prevMonthMoment.clone().startOf('month').toDate();
    const prevMonthEndDate = prevMonthMoment.clone().endOf('month').toDate();

    const monthName = prevMonthMoment.format('MMMM');
    const year = prevMonthMoment.format('YYYY');

    console.log(`[CRON DATE CALC] Reporting for month: ${monthName} ${year}`.magenta);
    console.log(`[CRON DATE CALC] Query Start (UTC for DB): ${prevMonthStartDate.toISOString()}`.magenta);
    console.log(`[CRON DATE CALC] Query End (UTC for DB): ${prevMonthEndDate.toISOString()}`.magenta);

    const users = await User.find({ 'emailPreferences.monthlyReport': true, email: { $ne: null } });
    // ... (rest of the monthly report logic, using prevMonthStartDate and prevMonthEndDate for queries)
    for (const user of users) {
      try {
        const incomePromise = Transaction.aggregate([
          { $match: { user: user._id, type: 'income', date: { $gte: prevMonthStartDate, $lte: prevMonthEndDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        // ... (similar for expensePromise, topSpendingPromise) ...
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

    console.log('[CRON END] Monthly overview report job finished.'.cyan);
  }), {
    scheduled: true,
    timezone: TARGET_TIMEZONE
  });
};


// --- Initialize all schedulers ---
export const initializeScheduler = () => {
  if (process.env.NODE_ENV !== 'test') {
    scheduleDailyReport();
    scheduleMonthlyReport();
    console.log(`Cron jobs initialized. Target timezone: ${TARGET_TIMEZONE}`.magenta);
  } else {
    console.log('Cron jobs skipped in test environment.'.gray);
  }
};