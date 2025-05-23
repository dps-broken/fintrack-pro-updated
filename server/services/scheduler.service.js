// server/services/scheduler.service.js
import cron from 'node-cron';
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Category from '../models/Category.model.js';
import { sendDailyExpenseReport, sendMonthlyOverviewReport } from './email.service.js';
import moment from 'moment-timezone'; // Import moment-timezone
import colors from 'colors';

const TARGET_TIMEZONE = "Asia/Kolkata";

// --- Daily Expense Report Job ---
const scheduleDailyReport = () => {
  cron.schedule('42 1 * * *', asyncHandler(async () => { // Example: 12:13 AM in TARGET_TIMEZONE
    const jobRunTimeMoment = moment.tz(TARGET_TIMEZONE);
    console.log(`[CRON START] Daily report job initiated at: ${jobRunTimeMoment.format('YYYY-MM-DD HH:mm:ss Z')} (${TARGET_TIMEZONE})`.cyan);

    const yesterdayMoment = jobRunTimeMoment.clone().subtract(1, 'day');

    // startDate and endDate for DB query (these will be UTC JS Date objects)
    const startDate = yesterdayMoment.clone().startOf('day').toDate();
    const endDate = yesterdayMoment.clone().endOf('day').toDate();

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
              date: { $gte: startDate, $lte: endDate }
            }
          },
          { $group: { _id: '$category', totalSpent: { $sum: '$amount' }}},
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' }},
          { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true }},
          { $project: { _id: 0, categoryName: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] }, totalSpent: 1 }},
          { $sort: { totalSpent: -1 } }
        ]);

        const totalSpentForReportDate = expensesForYesterday.reduce((sum, item) => sum + item.totalSpent, 0);
        
        // IMPORTANT: The 'date' passed to sendDailyExpenseReport
        // should be the date the report is FOR, formatted in a way that
        // email.service.js can correctly display it.
        // Passing the moment object for "yesterday" (in TARGET_TIMEZONE) then converting to ISO string.
        // email.service.js will then parse this ISO string.
        const reportData = {
          totalSpentToday: totalSpentForReportDate,
          expensesByCategory: expensesForYesterday,
          // This 'date' represents the *start* of "yesterday" in TARGET_TIMEZONE, converted to a UTC ISO string.
          // When new Date(reportData.date) is done in email.service.js, it creates a date object
          // representing this specific point in time (UTC).
          // If email.service.js formats it WITHOUT specifying a timezone, it will use server's default.
          // This might still lead to the date being off by one day if server timezone != TARGET_TIMEZONE.
          date: yesterdayMoment.clone().startOf('day').toDate().toISOString(),
        };
        
        // Log what date string is being sent for the report
        let displayDateForLog;
        try {
            // Attempt to format it as it might appear if email service uses server's local time
            displayDateForLog = new Date(reportData.date).toLocaleDateString('en-IN', {month: 'long', day: 'numeric', year: 'numeric'});
        } catch(e){
            displayDateForLog = reportData.date; // fallback to ISO if formatting fails
        }
        console.log(`[CRON USER REPORT DATA for ${user.email}] Report Date (ISO for email service): ${reportData.date}, Display attempt for log: ${displayDateForLog}, Total Spent: ${reportData.totalSpentToday}`.yellow);


        if (user.email) {
            await sendDailyExpenseReport(user, reportData);
            // Log the date the report was *intended* for, in target timezone
            console.log(`Daily report email triggered for ${user.email} for expenses of ${yesterdayMoment.format('YYYY-MM-DD')}`.green);
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
    timezone: TARGET_TIMEZONE
  });
};


// --- Monthly Overview Report Job (Also updated to use moment-timezone for consistency) ---
const scheduleMonthlyReport = () => {
  cron.schedule('0 9 1 * *', asyncHandler(async () => {
    const jobRunTimeMoment = moment.tz(TARGET_TIMEZONE);
    console.log(`[CRON START] Monthly overview job initiated at: ${jobRunTimeMoment.format('YYYY-MM-DD HH:mm:ss Z')} (${TARGET_TIMEZONE})`.cyan);

    const prevMonthMoment = jobRunTimeMoment.clone().subtract(1, 'month');

    const prevMonthStartDate = prevMonthMoment.clone().startOf('month').toDate();
    const prevMonthEndDate = prevMonthMoment.clone().endOf('month').toDate();

    const monthName = prevMonthMoment.format('MMMM'); // Format in target timezone
    const year = prevMonthMoment.format('YYYY');    // Format in target timezone

    console.log(`[CRON DATE CALC] Reporting for month: ${monthName} ${year}`.magenta);
    console.log(`[CRON DATE CALC] Query Start (UTC for DB): ${prevMonthStartDate.toISOString()}`.magenta);
    console.log(`[CRON DATE CALC] Query End (UTC for DB): ${prevMonthEndDate.toISOString()}`.magenta);

    const users = await User.find({ 'emailPreferences.monthlyReport': true, email: { $ne: null } });

    for (const user of users) {
      console.log(`[CRON USER] Processing monthly overview for: ${user.email}`.blue);
      try {
        // ... (aggregation logic remains the same, using prevMonthStartDate and prevMonthEndDate)
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
          monthName, // This is already correctly formatted for TARGET_TIMEZONE
          year,      // This is also correctly formatted for TARGET_TIMEZONE
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