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
const EMAIL_FROM_NAME_HARDCODED = "FinTrack Pro";
const EMAIL_FROM_ADDRESS_HARDCODED = "services.fintrackpro@gmail.com";
// --- END HARDCODED ---

const TARGET_TIMEZONE_FOR_DISPLAY = "Asia/Kolkata";
// Updated LOGO URL with the one you provided
const LOGO_URL_FOR_EMAIL = "https://fintrack-pro-updated.vercel.app/static/media/fintrack-logo.45dcbd56411cd9a12c0e.png";

let transporter;

console.log("Email Service: Using HARDCODED email credentials for debugging.".magenta.bold);

if (EMAIL_HOST_HARDCODED && EMAIL_USER_HARDCODED && EMAIL_PASS_HARDCODED) {
  try {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST_HARDCODED,
      port: EMAIL_PORT_HARDCODED,
      secure: EMAIL_SECURE_HARDCODED,
      auth: {
        user: EMAIL_USER_HARDCODED,
        pass: EMAIL_PASS_HARDCODED,
      },
      tls: {}
    });
    transporter.verify((error, success) => {
      if (error) {
          console.error('Error configuring email transporter (verify failed - hardcoded):'.red, error.message);
          transporter = null;
      } else {
          console.log('Email transporter configured successfully. Server is ready to send emails (hardcoded).'.green);
      }
    });
  } catch (initError) {
      console.error('Error initializing Nodemailer transporter with hardcoded values:'.red, initError);
      transporter = null;
  }
} else {
  console.error('CRITICAL: One or more essential HARDCODED email variables (HOST, USER, PASS) are missing. Email sending disabled.'.red.bold);
  transporter = null;
}

const sendEmail = asyncHandler(async (options) => {
  if (!transporter) {
    console.error('Email transporter not initialized (hardcoded check). Cannot send email.'.red);
    throw new Error('Email service is not configured or transporter failed to initialize.');
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
    console.log(`Email sent (using hardcoded config): ${info.messageId}`.blue);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${options.to} (using hardcoded config):`.red, error.message);
    console.error("Full Nodemailer send error object:".red, error);
    throw error;
  }
});

const getBaseEmailStyles = () => `
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f7f6; color: #333; }
        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #2c3e50; margin-top: 0; }
        p { margin-bottom: 15px; }
        ul { margin-bottom: 15px; padding-left: 20px; }
        strong { color: #007bff; } /* Example primary color */
        .footer-link { color: #007bff; text-decoration: none; }
        .signature-block { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: right; }
        .signature-block img { width: 80px; height: auto; display: block; margin-left: auto; margin-bottom: 5px; }
        .signature-text { font-style: italic; font-size: 0.9em; color: #555; }
        .unsubscribe-text { font-size: 0.8em; color: #777; margin-top: 20px; text-align: center; }
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

  let categoryDetails = "";
  if (expensesByCategory && expensesByCategory.length > 0) {
    categoryDetails = expensesByCategory
      .map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`)
      .join('');
  } else {
    categoryDetails = `<li>No expenses recorded for ${formattedDateForEmail}.</li>`;
  }

  const subject = `Your Daily Expense Report – ₹${totalSpentToday.toFixed(2)} Spent on ${formattedDateForEmail}`;
  const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Expense Report</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-container">
            <h2>Daily Expense Report - ${formattedDateForEmail}</h2>
            <p>Hi ${user.name || 'User'},</p>
            <p>For ${formattedDateForEmail}, you spent a total of <strong>₹${totalSpentToday.toFixed(2)}</strong>.</p>
            ${expensesByCategory && expensesByCategory.length > 0 ? `
            <p>Here's a breakdown by category:</p>
            <ul>
              ${categoryDetails}
            </ul>` : `<p>No expenses were logged for this day.</p>`}
            <p>Track more at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="footer-link">FinTrack Pro</a>.</p>
            
            <div class="signature-block">
                <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo">
                <p class="signature-text">Regards,<br>Team FinTrack</p>
            </div>

            <p class="unsubscribe-text">
                <small>If you wish to stop receiving these daily reports, you can update your preferences in your FinTrack Pro profile settings.</small>
            </p>
        </div>
    </body>
    </html>
  `;
  const textBody = `
    Daily Expense Report - ${formattedDateForEmail}\n
    Hi ${user.name || 'User'},\n
    For ${formattedDateForEmail}, you spent a total of ₹${totalSpentToday.toFixed(2)}.\n
    ${expensesByCategory && expensesByCategory.length > 0 ? `Breakdown:\n${expensesByCategory.map(cat => `- ${cat.categoryName}: ₹${cat.totalSpent.toFixed(2)}`).join('\n')}` : 'No expenses logged for this day.'}\n
    Track more at FinTrack Pro: ${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard\n
    To unsubscribe, update your profile settings.\n\n
    Regards,\n
    Team FinTrack
  `;

  await sendEmail({ to: user.email, subject, text: textBody, html: htmlBody });
});

export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
    if (!user.emailPreferences.monthlyReport || !user.email) return;
    const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;

    let categoryDetails = "";
    if (topSpendingCategories && topSpendingCategories.length > 0) {
      categoryDetails = topSpendingCategories.map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`).join('');
    } else {
      categoryDetails = "<li>No expenses recorded this month.</li>";
    }
    let suggestionsHtml = "";
    if (suggestions && suggestions.length > 0) {
      suggestionsHtml = `<p><strong>Suggestions for next month:</strong></p><ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
    }
    const subject = `Your Monthly Financial Overview for ${monthName} ${year}`;
    const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Monthly Financial Overview</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-container">
            <h2>Monthly Financial Overview - ${monthName} ${year}</h2>
            <p>Hi ${user.name || 'User'},</p>
            <p>Here's your financial summary for ${monthName} ${year}:</p>
            <ul>
              <li><strong>Total Income:</strong> ₹${totalIncome.toFixed(2)}</li>
              <li><strong>Total Expenses:</strong> ₹${totalExpense.toFixed(2)}</li>
              <li><strong>Net Savings:</strong> ₹${netSavings.toFixed(2)} (${netSavings >= 0 ? 'Saved' : 'Overspent'})</li>
            </ul>
            ${topSpendingCategories && topSpendingCategories.length > 0 ? `<p><strong>Your top spending categories were:</strong></p><ul>${categoryDetails}</ul>` : '<p>No expenses logged this month.</p>'}
            ${suggestionsHtml}
            <p>Review your finances in detail at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="footer-link">FinTrack Pro</a>.</p>
            <div class="signature-block">
                <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo">
                <p class="signature-text">Regards,<br>Team FinTrack</p>
            </div>
            <p class="unsubscribe-text"><small>To manage email preferences, visit your profile settings on FinTrack Pro.</small></p>
        </div>
    </body></html>`;
    const textBody = `Monthly Overview for ${monthName} ${year}...\nTotal Income: ₹${totalIncome.toFixed(2)}\nTotal Expense: ₹${totalExpense.toFixed(2)}\nNet Savings: ₹${netSavings.toFixed(2)}\n\nRegards,\nTeam FinTrack`;

    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
    if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) return;
    
    const budgetName = budget.name || (budget.category ? (budget.category.name || "A category") + " Budget" : "Overall Budget");
    const budgetStartDateObject = new Date(budget.startDate);
    const budgetStartDateFormatted = budgetStartDateObject.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        timeZone: TARGET_TIMEZONE_FOR_DISPLAY
    });

    const subject = `⚠️ Budget Alert: You've spent ${percentage}% of your ${budgetName}!`;
    const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Budget Alert</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-container">
            <h2>Budget Alert!</h2>
            <p>Hi ${user.name || 'User'},</p>
            <p>This is an alert regarding your budget: <strong>"${budgetName}"</strong>.</p>
            <p>You have spent <strong>₹${totalSpent.toFixed(2)}</strong> of your allocated <strong>₹${budget.amount.toFixed(2)}</strong>.
            This is <strong>${percentage}%</strong> of your budget for the current period (starting ${budgetStartDateFormatted}).</p>
            ${percentage >= 100 ? "<p><strong>You have exceeded this budget.</strong></p>" : ""}
            <p>Consider reviewing your spending to stay on track.</p>
            <p>Manage your budgets at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/budget" class="footer-link">FinTrack Pro Budgets</a>.</p>
            <div class="signature-block">
                <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo">
                <p class="signature-text">Regards,<br>Team FinTrack</p>
            </div>
            <p class="unsubscribe-text"><small>You can disable these alerts in your budget settings or profile preferences on FinTrack Pro.</small></p>
        </div>
    </body></html>`;
    const textBody = `Budget Alert: ${percentage}% of ${budgetName} spent. Period starting ${budgetStartDateFormatted}.\n\nRegards,\nTeam FinTrack`;

    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
    const subject = 'Password Reset Request for FinTrack Pro';
    const htmlBody = `
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Password Reset</title>
        ${getBaseEmailStyles()}
    </head>
    <body>
        <div class="email-container">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || 'User'},</p>
            <p>You requested a password reset for your FinTrack Pro account.</p>
            <p>Please click on the following link, or paste it into your browser to complete the process:</p>
            <p><a href="${resetUrl}" class="footer-link">${resetUrl}</a></p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 10 minutes.</p>
            <div class="signature-block">
                <img src="${LOGO_URL_FOR_EMAIL}" alt="FinTrack Pro Logo">
                <p class="signature-text">Regards,<br>Team FinTrack</p>
            </div>
        </div>
    </body></html>`;
    const textBody = `Password Reset for FinTrack Pro. Visit ${resetUrl} to reset. Link expires in 10 mins. If not you, ignore this.\n\nRegards,\nTeam FinTrack`;

    await sendEmail({ to: user.email, subject, html: htmlBody, text: textBody });
});

export default sendEmail; // Exporting the generic one as default