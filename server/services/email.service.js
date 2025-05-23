// server/services/email.service.js
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import colors from 'colors';

// --- HARDCODED EMAIL DETAILS ---
const EMAIL_HOST_HARDCODED = "smtp.gmail.com";
const EMAIL_PORT_HARDCODED = 587;
const EMAIL_SECURE_HARDCODED = false;
const EMAIL_USER_HARDCODED = "services.fintrackpro@gmail.com";
const EMAIL_PASS_HARDCODED = "nwtnzdjgbxzzwsyo";
const EMAIL_FROM_NAME_HARDCODED = "FinTrack Pro"; // Appears as sender name
const EMAIL_FROM_ADDRESS_HARDCODED = "services.fintrackpro@gmail.com"; // Actual sending address
// --- END HARDCODED ---

const TARGET_TIMEZONE_FOR_DISPLAY = "Asia/Kolkata";
const LOGO_URL_FOR_EMAIL = "https://fintrack-pro-updated.vercel.app/static/media/fintrack-logo.45dcbd56411cd9a12c0e.png";
const APP_NAME_STYLED = `<span style="color: #22a6b3; font-weight: bold;">FinTrack Pro</span>`; // Sky Blue for App Name

let transporter;
// ... (transporter setup code remains the same) ...
console.log("Email Service: Using HARDCODED email credentials for debugging.".magenta.bold);
if (EMAIL_HOST_HARDCODED && EMAIL_USER_HARDCODED && EMAIL_PASS_HARDCODED) {
  try {
    transporter = nodemailer.createTransport({ /* ... */ });
    transporter.verify((error, success) => { /* ... */ });
  } catch (initError) { /* ... */ }
} else { /* ... */ }


const sendEmail = asyncHandler(async (options) => {
  // ... (sendEmail logic remains the same) ...
  if (!transporter) {
    console.error('Email transporter not initialized. Cannot send email.'.red);
    throw new Error('Email service is not configured.');
  }
  const mailOptions = {
    from: `"${EMAIL_FROM_NAME_HARDCODED}" <${EMAIL_FROM_ADDRESS_HARDCODED}>`,
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
    console.error(`Error sending email to ${options.to}:`.red, error.message);
    throw error;
  }
});


const getBaseEmailStyles = () => `
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.65; margin: 0; padding: 0; background-color: #f8f9fa; color: #495057; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .email-wrapper { padding: 20px; }
        .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 6px 25px rgba(0,0,0,0.08); border: 1px solid #e9ecef; }
        .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px dashed #dee2e6; }
        .header img.logo-header { max-width: 120px; margin-bottom: 10px; }
        .app-name-header { color: #22a6b3; font-size: 28px; font-weight: bold; margin: 0; }
        h2.section-title { color: #22a6b3; font-size: 22px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #22a6b3; padding-bottom: 5px; display: inline-block; }
        p { margin-bottom: 18px; font-size: 16px; }
        strong.highlight { color: #e74c3c; } /* For expenses */
        strong.highlight-income { color: #2ecc71; } /* For income */
        ul { margin-bottom: 20px; padding-left: 25px; list-style-type: '➡️ '; } /* Custom bullet */
        li { margin-bottom: 8px; }
        .table-container { margin-top: 20px; margin-bottom: 25px; overflow-x: auto; }
        table.expenses-table { width: 100%; border-collapse: collapse; }
        .expenses-table th, .expenses-table td { border: 1px solid #e0e0e0; padding: 10px 12px; text-align: left; font-size: 15px; }
        .expenses-table th { background-color: #f0f5ff; color: #333; font-weight: 600; }
        .expenses-table td.amount { text-align: right; font-weight: 500; }
        .total-row td { font-weight: bold; background-color: #f9f9f9; }
        .cta-button { display: inline-block; background-color: #22a6b3; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; transition: background-color 0.2s ease; text-align: center;}
        .cta-button:hover { background-color: #1e90a3; }
        .button-container { text-align: center; margin-top: 25px; margin-bottom: 25px;}
        .signature-block { margin-top: 35px; padding-top: 25px; border-top: 1px solid #e9ecef; text-align: right; }
        .signature-block img.logo-footer { width: 70px; height: auto; display: block; margin-left: auto; margin-bottom: 8px; opacity: 0.8; }
        .signature-text { font-style: normal; font-size: 15px; color: #555; line-height: 1.5; }
        .unsubscribe-text { font-size: 13px; color: #888; margin-top: 25px; text-align: center; }
        .emoji { margin-right: 5px; }
    </style>
`;


export const sendDailyExpenseReport = asyncHandler(async (user, reportData) => {
  if (!user.emailPreferences.dailyReport || !user.email) {
      console.log(`Skipping daily report for ${user.email || user._id}: user opted out or no email.`.gray);
      return;
  }

  const { totalSpentToday, expensesByCategory, date: reportDateISO } = reportData;
  const dateObjectForDisplay = new Date(reportDateISO);
  const formattedDateForEmail = dateObjectForDisplay.toLocaleDateString('en-IN', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: TARGET_TIMEZONE_FOR_DISPLAY
  });

  console.log(`[Email Service] Date received for report: ${reportDateISO}, Formatted for email as (${TARGET_TIMEZONE_FOR_DISPLAY}): ${formattedDateForEmail}`.yellow);

  let expenseTableRows = "";
  if (expensesByCategory && expensesByCategory.length > 0) {
    expensesByCategory.forEach(cat => {
      expenseTableRows += `
        <tr>
          <td><span class="emoji">🛍️</span> ${cat.categoryName || 'Uncategorized'}</td>
          <td class="amount">₹${cat.totalSpent.toFixed(2)}</td>
        </tr>
      `;
    });
    expenseTableRows += `
        <tr class="total-row">
          <td><strong>Total Expenses</strong></td>
          <td class="amount"><strong>₹${totalSpentToday.toFixed(2)}</strong></td>
        </tr>
    `;
  } else {
    expenseTableRows = `<tr><td colspan="2" style="text-align:center; padding: 20px;">🎉 Yay! No expenses recorded for ${formattedDateForEmail}.</td></tr>`;
  }

  const subject = `📊 Your FinTrack Daily Digest for ${formattedDateForEmail} – ₹${totalSpentToday.toFixed(2)} Spent`;
  
  const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your FinTrack Daily Digest</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <div class="header">
                    <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-header">
                    <h1 class="app-name-header">FinTrack Pro</h1>
                </div>

                <p>Namaste ${user.name || 'FinTracker'} 👋,</p>
                <p>Here's your personalized expense summary from ${APP_NAME_STYLED} for <strong>${formattedDateForEmail}</strong>. We hope this helps you stay on top of your finances!</p>
                
                <h2 class="section-title">💰 Daily Spending Snapshot</h2>
                <p>Your total expenditure for the day was <strong class="highlight">₹${totalSpentToday.toFixed(2)}</strong>.</p>

                <div class="table-container">
                    <table class="expenses-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th style="text-align:right;">Amount Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenseTableRows}
                        </tbody>
                    </table>
                </div>
                
                ${totalSpentToday > 0 ? `<p>Reviewing these details can help you understand your spending habits. Were these planned expenses, or are there areas where you could optimize? 🤔</p>` : ''}

                <div class="button-container">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="cta-button">View Full Dashboard 🚀</a>
                </div>
                
                <p>Remember, consistent tracking is the first step towards financial well-being. Keep up the great work!</p>

                <div class="signature-block">
                    <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-footer">
                    <p class="signature-text">Best Regards,<br>The ${APP_NAME_STYLED} Team</p>
                </div>

                <p class="unsubscribe-text">
                    <small>To manage your email preferences, please visit your profile settings on ${APP_NAME_STYLED}.</small>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
  const textBody = `
    Your FinTrack Daily Digest for ${formattedDateForEmail}\n
    --------------------------------------------------\n
    Namaste ${user.name || 'FinTracker'} 👋,\n
    Here's your personalized expense summary from FinTrack Pro for ${formattedDateForEmail}.\n
    💰 Daily Spending Snapshot: You spent a total of ₹${totalSpentToday.toFixed(2)}.\n
    Expense Breakdown:\n
    ${expensesByCategory && expensesByCategory.length > 0 ? expensesByCategory.map(cat => `- ${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}`).join('\n') : 'No expenses recorded.'}\n
    Total: ₹${totalSpentToday.toFixed(2)}\n\n
    View Full Dashboard: ${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard 🚀\n
    Keep tracking for financial well-being!\n\n
    Best Regards,\n
    The FinTrack Pro Team
  `;

  await sendEmail({ to: user.email, subject, text: textBody, html: htmlBody });
});


// --- sendMonthlyOverviewReport Update ---
export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
    if (!user.emailPreferences.monthlyReport || !user.email) return;
    const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;

    let topSpendingHtml = "";
    if (topSpendingCategories && topSpendingCategories.length > 0) {
        topSpendingHtml = topSpendingCategories.map(cat => `
            <tr>
                <td><span class="emoji">💸</span> ${cat.categoryName || 'Uncategorized'}</td>
                <td class="amount">₹${cat.totalSpent.toFixed(2)}</td>
            </tr>`).join('');
    } else {
        topSpendingHtml = `<tr><td colspan="2" style="text-align:center; padding: 20px;">No expenses recorded this month.</td></tr>`;
    }

    let suggestionsHtmlList = "";
    if (suggestions && suggestions.length > 0) {
      suggestionsHtmlList = `<ul>${suggestions.map(s => `<li><span class="emoji">💡</span> ${s}</li>`).join('')}</ul>`;
    }

    const subject = `✨ Your ${APP_NAME_STYLED} Monthly Financial Review: ${monthName} ${year}`;
    const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Monthly Financial Review</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <div class="header">
                    <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-header">
                    <h1 class="app-name-header">FinTrack Pro</h1>
                </div>

                <p>Hello ${user.name || 'FinTracker'}!</p>
                <p>Here's your comprehensive financial review for <strong>${monthName} ${year}</strong>, brought to you by ${APP_NAME_STYLED}. Let's see how you did!</p>

                <h2 class="section-title">📊 Monthly Financial Summary</h2>
                <div class="table-container">
                    <table class="expenses-table">
                        <tbody>
                            <tr><td><span class="emoji">💰</span> Total Income:</td><td class="amount"><strong class="highlight-income">+ ₹${totalIncome.toFixed(2)}</strong></td></tr>
                            <tr><td><span class="emoji">💳</span> Total Expenses:</td><td class="amount"><strong class="highlight">- ₹${totalExpense.toFixed(2)}</strong></td></tr>
                            <tr class="total-row"><td><span class="emoji">🏦</span> Net Savings:</td><td class="amount"><strong>₹${netSavings.toFixed(2)}</strong> (${netSavings >= 0 ? 'Saved 👍' : 'Overspent 📉'})</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2 class="section-title">🏆 Top Spending Categories</h2>
                <div class="table-container">
                     <table class="expenses-table">
                        <thead><tr><th>Category</th><th style="text-align:right;">Amount Spent</th></tr></thead>
                        <tbody>${topSpendingHtml}</tbody>
                    </table>
                </div>
                
                ${suggestionsHtmlList ? `<h2 class="section-title">🌟 Smart Suggestions for Next Month</h2>${suggestionsHtmlList}` : ''}

                <p>Use these insights to plan better for the upcoming month. Consistent effort leads to great financial health!</p>
                <div class="button-container">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Dive Deeper in Dashboard ✨</a>
                </div>

                <div class="signature-block">
                    <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-footer">
                    <p class="signature-text">Cheers to your financial journey,<br>The ${APP_NAME_STYLED} Team</p>
                </div>
                <p class="unsubscribe-text"><small>Manage your email preferences in your ${APP_NAME_STYLED} profile settings.</small></p>
            </div>
        </div>
    </body></html>`;
    // Update textBody for monthly report as well

    await sendEmail({ to: user.email, subject, html: htmlBody, text: `Your ${monthName} ${year} Financial Review...` });
});


// --- sendBudgetBreachAlert Update ---
export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
    if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) return;
    
    const budgetName = budget.name || (budget.category ? (budget.category.name || "A category") + " Budget" : "Overall Budget");
    const budgetStartDateObject = new Date(budget.startDate);
    const budgetStartDateFormatted = budgetStartDateObject.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        timeZone: TARGET_TIMEZONE_FOR_DISPLAY
    });

    const subject = `🔔 ${APP_NAME_STYLED} Budget Alert: ${percentage}% of ${budgetName} Used!`;
    const htmlBody = `
    <html lang="en">
    <head><meta charset="UTF-8"><title>Budget Alert</title>${getBaseEmailStyles()}</head>
    <body>
    <div class="email-wrapper"><div class="email-container">
        <div class="header">
            <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-header">
            <h1 class="app-name-header">FinTrack Pro</h1>
        </div>
        <p>Hi ${user.name || 'User'}, <span class="emoji">👋</span></p>
        <p>Heads up! This is an important alert regarding your budget: <strong>"${budgetName}"</strong> from ${APP_NAME_STYLED}.</p>
        
        <h2 class="section-title">🚨 Budget Status Update</h2>
        <p>You have currently spent <strong class="highlight">₹${totalSpent.toFixed(2)}</strong> of your allocated budget of <strong>₹${budget.amount.toFixed(2)}</strong>.</p>
        <p>This means you've utilized <strong>${percentage.toFixed(1)}%</strong> of your budget for the period starting ${budgetStartDateFormatted}.</p>
        
        ${percentage >= 100 ? "<p style='color:red; font-weight:bold;'>🛑 ACTION REQUIRED: You have exceeded this budget. Please review your spending immediately.</p>" : (percentage >= 80 ? "<p style='color:orange; font-weight:bold;'>⚠️ CAUTION: You are close to exceeding your budget. Monitor your upcoming expenses carefully.</p>" : "<p>You're still within your budget limits. Keep tracking!</p>")}
        
        <div class="button-container">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/budget" class="cta-button">Manage Your Budgets 🛠️</a>
        </div>
        <p>Staying aware of your budget helps you achieve your financial goals. ${APP_NAME_STYLED} is here to help!</p>
        <div class="signature-block">
            <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-footer">
            <p class="signature-text">Stay Budget Savvy,<br>The ${APP_NAME_STYLED} Team</p>
        </div>
        <p class="unsubscribe-text"><small>Disable these alerts in budget settings or profile preferences on ${APP_NAME_STYLED}.</small></p>
    </div></div></body></html>`;
    // Update textBody for budget alert

    await sendEmail({ to: user.email, subject, html: htmlBody, text: `Budget Alert: ${percentage}% of ${budgetName} spent.` });
});


// --- sendPasswordResetEmail (Simple update for consistency) ---
export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
    const subject = `🔑 Password Reset Request for ${APP_NAME_STYLED}`;
    const htmlBody = `
    <html lang="en">
    <head><meta charset="UTF-8"><title>Password Reset</title>${getBaseEmailStyles()}</head>
    <body>
    <div class="email-wrapper"><div class="email-container">
        <div class="header">
            <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-header">
            <h1 class="app-name-header">FinTrack Pro</h1>
        </div>
        <p>Hi ${user.name || 'User'},</p>
        <p>We received a request to reset the password for your ${APP_NAME_STYLED} account associated with this email address.</p>
        <p>To reset your password, please click on the link below (or copy and paste it into your browser):</p>
        <div class="button-container" style="margin-top: 15px; margin-bottom:15px;">
            <a href="${resetUrl}" class="cta-button">Reset Your Password</a>
        </div>
        <p style="text-align:center; word-break:break-all; font-size:12px;"><a href="${resetUrl}" class="footer-link">${resetUrl}</a></p>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged. This link is valid for 10 minutes.</p>
        <div class="signature-block">
            <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-footer">
            <p class="signature-text">Securely yours,<br>The ${APP_NAME_STYLED} Team</p>
        </div>
    </div></div></body></html>`;
    // Update textBody for password reset

    await sendEmail({ to: user.email, subject, html: htmlBody, text: `Password Reset for FinTrack Pro. Visit ${resetUrl} to reset.` });
});

export default sendEmail;