// server/services/email.service.js
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import colors from 'colors';

// --- HARDCODED EMAIL DETAILS - FOR DEBUGGING ONLY ---
// !! IMPORTANT: REPLACE WITH YOUR ACTUAL CREDENTIALS FOR TESTING !!
// !! AND REMOVE/COMMENT OUT BEFORE PRODUCTION / SHARING CODE !!
const EMAIL_HOST_HARDCODED = "smtp.gmail.com";
const EMAIL_PORT_HARDCODED = 587; // Standard port for SMTP with STARTTLS
const EMAIL_SECURE_HARDCODED = false; // false because we use STARTTLS on port 587
const EMAIL_USER_HARDCODED = "services.fintrackpro@gmail.com"; // Your Gmail address
const EMAIL_PASS_HARDCODED = "nwtnzdjgbxzzwsyo"; // Your Gmail App Password
const EMAIL_FROM_NAME_HARDCODED = "FinTrack Pro";
const EMAIL_FROM_ADDRESS_HARDCODED = "services.fintrackpro@gmail.com"; // Can be same as user
// --- END HARDCODED EMAIL DETAILS ---

const TARGET_TIMEZONE_FOR_DISPLAY = "Asia/Kolkata";
const LOGO_URL_FOR_EMAIL = "https://fintrack-pro-updated.vercel.app/static/media/fintrack-logo.45dcbd56411cd9a12c0e.png";
const APP_NAME_STYLED = `<span style="color: #22a6b3; font-weight: bold;">FinTrack Pro</span>`;

let transporter; // Declare globally within the module

console.log("Email Service: Initializing with HARDCODED email credentials...".magenta.bold);

if (EMAIL_HOST_HARDCODED && EMAIL_USER_HARDCODED && EMAIL_PASS_HARDCODED) {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST_HARDCODED,
      port: EMAIL_PORT_HARDCODED,
      secure: EMAIL_SECURE_HARDCODED, // For port 587, 'secure' is false, STARTTLS is used.
      auth: {
        user: EMAIL_USER_HARDCODED,
        pass: EMAIL_PASS_HARDCODED,
      },
      // Explicitly require TLS for port 587 if secure is false
      requireTLS: !EMAIL_SECURE_HARDCODED && EMAIL_PORT_HARDCODED === 587,
      // For deep debugging of Nodemailer's actions:
      // logger: true,
      // debug: true, 
      // Optional: If you face TLS/SSL issues, sometimes these help, but be cautious:
      // tls: {
      //   ciphers:'SSLv3', // Example, might be needed for older servers, unlikely for Gmail
      //   rejectUnauthorized: false // DANGEROUS for production, use only for local test with self-signed certs
      // }
    });
    console.log(`Nodemailer transporter instance CREATED with host: ${EMAIL_HOST_HARDCODED}, port: ${EMAIL_PORT_HARDCODED}, secure: ${EMAIL_SECURE_HARDCODED}`.cyan);

    // Verify connection configuration
    // This verify step makes an actual connection attempt to the SMTP server.
    console.log("Attempting to VERIFY transporter connection...".yellow);
    transporter.verify((error, success) => {
      if (error) {
          console.error('Error VERIFYING email transporter (hardcoded):'.red.bold, error.message);
          console.error("Full verify error object:".red, error); // Log full error
          // It's possible verify fails but sendMail might still work, or vice-versa,
          // depending on specific server/network conditions.
          // Setting transporter to null here means no emails will be sent if verify fails.
          // transporter = null; 
          console.warn('Transporter verify FAILED. Emails might not send.'.yellow);
      } else {
          console.log('Email transporter VERIFIED successfully. Ready to send emails (hardcoded).'.green);
      }
    });

  } catch (initError) {
      console.error('Error INITIALIZING Nodemailer transporter with hardcoded values:'.red.bold, initError);
      transporter = null; // If createTransport itself fails
  }
} else {
  console.error('CRITICAL: One or more essential HARDCODED email variables (HOST, USER, PASS) are missing. Email sending will be disabled.'.red.bold);
  transporter = null;
}


const sendEmail = asyncHandler(async (options) => {
  if (!transporter) {
    const errorMsg = 'Email transporter is NOT INITIALIZED or FAILED to initialize. Cannot send email. Check server startup logs for transporter errors.';
    console.error(errorMsg.red.bold);
    throw new Error(errorMsg); // Ensure this error is thrown to be caught by the caller
  }

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME_HARDCODED}" <${EMAIL_FROM_ADDRESS_HARDCODED}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  console.log(`Attempting to send email via configured host: ${transporter.options.host}, port: ${transporter.options.port}`.blue);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully via ${transporter.options.host}: ${info.messageId}`.green);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${options.to} via host ${transporter.options.host}:`.red.bold, error.message);
    // Log specific connection properties if available in the error
    if (error.syscall === 'connect' && error.address && error.port) {
        console.error(`Nodemailer tried to connect to address: ${error.address}:${error.port}`.bgRed.white);
    }
    console.error("Full Nodemailer sendMail() error object:".red, error); // Log the full error object
    throw error; // Re-throw so calling function knows it failed
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
        strong.highlight { color: #e74c3c; }
        strong.highlight-income { color: #2ecc71; }
        ul { margin-bottom: 20px; padding-left: 25px; list-style-type: '➡️ '; }
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
    year: 'numeric', month: 'long', day: 'numeric', timeZone: TARGET_TIMEZONE_FOR_DISPLAY
  });

  console.log(`[Email Service DEBUG] Daily Report: Date received ISO: ${reportDateISO}, Formatted for email (${TARGET_TIMEZONE_FOR_DISPLAY}): ${formattedDateForEmail}`.yellow);

  let expenseTableRows = "";
  if (expensesByCategory && expensesByCategory.length > 0) {
    expensesByCategory.forEach(cat => {
      expenseTableRows += `<tr><td><span class="emoji">🛍️</span> ${cat.categoryName || 'Uncategorized'}</td><td class="amount">₹${cat.totalSpent.toFixed(2)}</td></tr>`;
    });
    expenseTableRows += `<tr class="total-row"><td><strong>Total Expenses</strong></td><td class="amount"><strong>₹${totalSpentToday.toFixed(2)}</strong></td></tr>`;
  } else {
    expenseTableRows = `<tr><td colspan="2" style="text-align:center; padding: 20px;">🎉 Yay! No expenses recorded for ${formattedDateForEmail}.</td></tr>`;
  }

  const subject = `📊 Your FinTrack Daily Digest for ${formattedDateForEmail} – ₹${totalSpentToday.toFixed(2)} Spent`;
  const htmlBody = `
    <html lang="en"><head><meta charset="UTF-8"><title>Your FinTrack Daily Digest</title>${getBaseEmailStyles()}</head>
    <body><div class="email-wrapper"><div class="email-container">
        <div class="header"><img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-header"><h1 class="app-name-header">FinTrack Pro</h1></div>
        <p>Namaste ${user.name || 'FinTracker'} 👋,</p>
        <p>Here's your personalized expense summary from ${APP_NAME_STYLED} for <strong>${formattedDateForEmail}</strong>.</p>
        <h2 class="section-title">💰 Daily Spending Snapshot</h2>
        <p>Your total expenditure for the day was <strong class="highlight">₹${totalSpentToday.toFixed(2)}</strong>.</p>
        <div class="table-container"><table class="expenses-table"><thead><tr><th>Category</th><th style="text-align:right;">Amount Spent</th></tr></thead><tbody>${expenseTableRows}</tbody></table></div>
        ${totalSpentToday > 0 ? `<p>Reviewing these details can help you understand your spending habits. 🤔</p>` : ''}
        <div class="button-container"><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="cta-button">View Full Dashboard 🚀</a></div>
        <p>Consistent tracking is key to financial well-being. Keep it up!</p>
        <div class="signature-block"><img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo" class="logo-footer"><p class="signature-text">Best Regards,<br>The ${APP_NAME_STYLED} Team</p></div>
        <p class="unsubscribe-text"><small>Manage email preferences in your ${APP_NAME_STYLED} profile.</small></p>
    </div></div></body></html>`;
  const textBody = `Your FinTrack Daily Digest for ${formattedDateForEmail}...\n(Full text body content here)\n\nRegards,\nThe FinTrack Pro Team`;
  
  console.log(`Triggering sendEmail for daily report to ${user.email}`.blue);
  await sendEmail({ to: user.email, subject, text: textBody, html: htmlBody });
});


export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
    if (!user.emailPreferences.monthlyReport || !user.email) return;
    const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;
    // ... (construct categoryDetails, suggestionsHtmlList as before) ...
    let topSpendingHtml = ""; /* ... */ let suggestionsHtmlList = ""; /* ... */
    const subject = `✨ Your ${APP_NAME_STYLED} Monthly Financial Review: ${monthName} ${year}`;
    const htmlBody = `
    <html lang="en"><head><meta charset="UTF-8"><title>Monthly Review</title>${getBaseEmailStyles()}</head>
    <body><div class="email-wrapper"><div class="email-container">
        <div class="header"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-header"><h1 class="app-name-header">FinTrack Pro</h1></div>
        <p>Hello ${user.name || 'FinTracker'}!</p>
        <p>Your financial review for <strong>${monthName} ${year}</strong> from ${APP_NAME_STYLED}:</p>
        <h2 class="section-title">📊 Monthly Summary</h2>
        <div class="table-container"><table class="expenses-table"><tbody>
            <tr><td><span class="emoji">💰</span> Income:</td><td class="amount"><strong class="highlight-income">+ ₹${totalIncome.toFixed(2)}</strong></td></tr>
            <tr><td><span class="emoji">💳</span> Expenses:</td><td class="amount"><strong class="highlight">- ₹${totalExpense.toFixed(2)}</strong></td></tr>
            <tr class="total-row"><td><span class="emoji">🏦</span> Savings:</td><td class="amount"><strong>₹${netSavings.toFixed(2)}</strong></td></tr>
        </tbody></table></div>
        <h2 class="section-title">🏆 Top Spending</h2>
        <div class="table-container"><table class="expenses-table"><thead><tr><th>Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>${topSpendingHtml}</tbody></table></div>
        ${suggestionsHtmlList ? `<h2 class="section-title">🌟 Suggestions</h2>${suggestionsHtmlList}` : ''}
        <div class="button-container"><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="cta-button">View Dashboard ✨</a></div>
        <div class="signature-block"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-footer"><p class="signature-text">Cheers,<br>The ${APP_NAME_STYLED} Team</p></div>
        <p class="unsubscribe-text"><small>Manage preferences in your ${APP_NAME_STYLED} profile.</small></p>
    </div></div></body></html>`;
    const textBody = `Monthly Review for ${monthName} ${year}...\n\nRegards,\nThe FinTrack Pro Team`;
    
    console.log(`Triggering sendEmail for monthly report to ${user.email}`.blue);
    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
    if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) return;
    const budgetName = budget.name || (budget.category ? (budget.category.name || "A category") + " Budget" : "Overall Budget");
    const budgetStartDateFormatted = new Date(budget.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: TARGET_TIMEZONE_FOR_DISPLAY });
    const subject = `🔔 ${APP_NAME_STYLED} Budget Alert: ${percentage}% of ${budgetName} Used!`;
    const htmlBody = `
    <html lang="en"><head><meta charset="UTF-8"><title>Budget Alert</title>${getBaseEmailStyles()}</head>
    <body><div class="email-wrapper"><div class="email-container">
        <div class="header"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-header"><h1 class="app-name-header">FinTrack Pro</h1></div>
        <p>Hi ${user.name || 'User'} <span class="emoji">👋</span>,</p>
        <p>Alert for budget: <strong>"${budgetName}"</strong> from ${APP_NAME_STYLED}.</p>
        <h2 class="section-title">🚨 Budget Status</h2>
        <p>Spent: <strong class="highlight">₹${totalSpent.toFixed(2)}</strong> / Budget: <strong>₹${budget.amount.toFixed(2)}</strong>.</p>
        <p>Usage: <strong>${percentage.toFixed(1)}%</strong> (Period starting ${budgetStartDateFormatted}).</p>
        ${percentage >= 100 ? "<p style='color:red;font-weight:bold;'>🛑 EXCEEDED BUDGET.</p>" : (percentage >= 80 ? "<p style='color:orange;font-weight:bold;'>⚠️ NEARING BUDGET LIMIT.</p>" : "")}
        <div class="button-container"><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/budget" class="cta-button">Manage Budgets 🛠️</a></div>
        <div class="signature-block"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-footer"><p class="signature-text">Stay Savvy,<br>The ${APP_NAME_STYLED} Team</p></div>
        <p class="unsubscribe-text"><small>Manage alerts in ${APP_NAME_STYLED}.</small></p>
    </div></div></body></html>`;
    const textBody = `Budget Alert: ${percentage}% of ${budgetName} spent.\n\nRegards,\nThe FinTrack Pro Team`;

    console.log(`Triggering sendEmail for budget alert to ${user.email}`.blue);
    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
    const subject = `🔑 Password Reset Request for ${APP_NAME_STYLED}`;
    const htmlBody = `
    <html lang="en"><head><meta charset="UTF-8"><title>Password Reset</title>${getBaseEmailStyles()}</head>
    <body><div class="email-wrapper"><div class="email-container">
        <div class="header"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-header"><h1 class="app-name-header">FinTrack Pro</h1></div>
        <p>Hi ${user.name || 'User'},</p>
        <p>Password reset request for your ${APP_NAME_STYLED} account:</p>
        <div class="button-container"><a href="${resetUrl}" class="cta-button">Reset Password</a></div>
        <p style="text-align:center;word-break:break-all;font-size:12px;"><a href="${resetUrl}" class="footer-link">${resetUrl}</a></p>
        <p>If not you, ignore this. Link expires in 10 mins.</p>
        <div class="signature-block"><img src="${LOGO_URL_FOR_EMAIL}" alt="Logo" class="logo-footer"><p class="signature-text">Securely yours,<br>The ${APP_NAME_STYLED} Team</p></div>
    </div></div></body></html>`;
    const textBody = `Password Reset for FinTrack Pro. Visit ${resetUrl}. Link expires in 10 mins.\n\nRegards,\nThe FinTrack Pro Team`;

    console.log(`Triggering sendEmail for password reset to ${user.email}`.blue);
    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export default sendEmail;