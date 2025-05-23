// server/services/email.service.js
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import colors from 'colors';

// --- HARDCODED EMAIL DETAILS - DEBUGGING PURPOSE ONLY ---
const EMAIL_HOST = "smtp.gmail.com";
const EMAIL_PORT = 587;
const EMAIL_SECURE = false;
const EMAIL_USER = "services.fintrackpro@gmail.com";
const EMAIL_PASS = "nwtnzdjgbxzzwsyo"; // Your Gmail App Password
const EMAIL_FROM_NAME = "FinTrack Pro";
const EMAIL_FROM_ADDRESS = "services.fintrackpro@gmail.com";
// ---------------------------------------------------------

let transporter;

console.log("Email Service: Using HARDCODED email credentials.".magenta.bold);

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
  console.error("Missing HARDCODED email config values.".red.bold);
  transporter = null;
} else {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("Transporter verification failed:".red, error.message);
        transporter = null;
      } else {
        console.log("Email transporter is ready to send messages.".green);
      }
    });
  } catch (err) {
    console.error("Transporter initialization error:".red, err.message);
    transporter = null;
  }
}

const sendEmail = asyncHandler(async (options) => {
  if (!transporter) {
    console.error("Transporter not initialized. Email not sent.".red);
    return;
  }

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`.blue);
    return info;
  } catch (error) {
    console.error(`Email send failed to ${options.to}:`.red, error.message);
    throw error;
  }
});

export const sendDailyExpenseReport = asyncHandler(async (user, reportData) => {
  if (!user.emailPreferences.dailyReport || !user.email) {
    console.log(`Skipping daily report: ${user.email}`.gray);
    return;
  }

  const { totalSpentToday, expensesByCategory, date } = reportData;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let categoryDetails = expensesByCategory && expensesByCategory.length > 0
    ? expensesByCategory.map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`).join('')
    : "<li>No expenses recorded today.</li>";

  const subject = `Your Daily Expense Report – ₹${totalSpentToday.toFixed(2)} Spent Today (${formattedDate})`;
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Daily Expense Report - ${formattedDate}</h2>
        <p>Hi ${user.name || 'User'},</p>
        <p>Today, you spent <strong>₹${totalSpentToday.toFixed(2)}</strong>.</p>
        ${expensesByCategory.length > 0 ? `<ul>${categoryDetails}</ul>` : ''}
        <p>Track more at <a href="http://localhost:3000/dashboard">FinTrack Pro</a>.</p>
        <hr>
        <p><small>To stop receiving daily reports, update your settings in FinTrack Pro.</small></p>
      </body>
    </html>
  `;
  const textBody = `You spent ₹${totalSpentToday.toFixed(2)} today. View details at FinTrack Pro.`;

  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});

export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
  if (!user.emailPreferences.monthlyReport || !user.email) {
    console.log(`Skipping monthly report: ${user.email}`.gray);
    return;
  }

  const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;

  let categoryDetails = topSpendingCategories && topSpendingCategories.length > 0
    ? topSpendingCategories.map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`).join('')
    : "<li>No spending data for this month.</li>";

  let suggestionHtml = suggestions && suggestions.length > 0
    ? `<ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`
    : '';

  const subject = `Your Monthly Overview – ${monthName} ${year}`;
  const htmlBody = `
    <html>
      <body>
        <h2>${monthName} ${year} – Financial Overview</h2>
        <p><strong>Total Income:</strong> ₹${totalIncome}</p>
        <p><strong>Total Expenses:</strong> ₹${totalExpense}</p>
        <p><strong>Net Savings:</strong> ₹${netSavings}</p>
        <h3>Top Spending Categories:</h3>
        <ul>${categoryDetails}</ul>
        ${suggestionHtml}
        <hr>
        <p><small>To stop monthly overviews, change your email preferences.</small></p>
      </body>
    </html>
  `;
  const textBody = `Monthly Report: Income ₹${totalIncome}, Expenses ₹${totalExpense}, Savings ₹${netSavings}.`;

  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});

export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
  if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) {
    console.log(`Skipping budget alert: ${user.email}`.gray);
    return;
  }

  const budgetName = budget.name || "Budget";
  const subject = `⚠️ Alert: You've used ${percentage}% of your ${budgetName}`;
  const htmlBody = `
    <html>
      <body>
        <h2>Budget Breach Alert</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>You've spent ₹${totalSpent.toFixed(2)} which is ${percentage}% of your <strong>${budgetName}</strong>.</p>
        <p>Take action before you overspend further!</p>
      </body>
    </html>
  `;
  const textBody = `Alert: You've used ${percentage}% of your ${budgetName}. Current spent: ₹${totalSpent.toFixed(2)}.`;

  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});

export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
  const subject = `Reset Your Password – FinTrack Pro`;
  const htmlBody = `
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </body>
    </html>
  `;
  const textBody = `Reset your password: ${resetUrl}`;

  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});
