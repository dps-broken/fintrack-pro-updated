// server/services/email.service.js
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import colors from 'colors'; // Ensure colors is imported

// --- HARDCODED EMAIL DETAILS - FOR DEBUGGING ONLY ---
const EMAIL_HOST_HARDCODED = "smtp.gmail.com";
const EMAIL_PORT_HARDCODED = 587;
const EMAIL_SECURE_HARDCODED = false;
const EMAIL_USER_HARDCODED = "services.fintrackpro@gmail.com";
const EMAIL_PASS_HARDCODED = "nwtnzdjgbxzzwsyo"; // Your actual App Password
const EMAIL_FROM_NAME_HARDCODED = "FinTrack Pro";
const EMAIL_FROM_ADDRESS_HARDCODED = "services.fintrackpro@gmail.com";
// --- END HARDCODED EMAIL DETAILS ---

const TARGET_TIMEZONE_FOR_DISPLAY = "Asia/Kolkata"; // For displaying dates correctly in emails

let transporter;

console.log("Email Service: Using HARDCODED email credentials for debugging.".magenta.bold);
// Removed placeholder password warning as you've likely replaced it

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
      tls: {
        // rejectUnauthorized: false // Generally not needed for Gmail if connection is secure
      }
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
    // return; // Or silently fail
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


export const sendDailyExpenseReport = asyncHandler(async (user, reportData) => {
  if (!user.emailPreferences.dailyReport || !user.email) {
      console.log(`Skipping daily report for ${user.email || user._id}: user opted out or no email.`.gray);
      return;
  }

  const { totalSpentToday, expensesByCategory, date: reportDateISO } = reportData; // 'date' is the ISO string from scheduler

  // --- THIS IS THE CRITICAL FIX FOR DATE DISPLAY ---
  const dateObjectForDisplay = new Date(reportDateISO); // Create JS Date from UTC ISO string
  const formattedDateForEmail = dateObjectForDisplay.toLocaleDateString('en-IN', { // Use 'en-IN' or 'en-US' as preferred
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: TARGET_TIMEZONE_FOR_DISPLAY // Explicitly format for Kolkata time
  });
  // --- END CRITICAL FIX ---

  console.log(`[Email Service] Date received for report: ${reportDateISO}, Formatted for email as (${TARGET_TIMEZONE_FOR_DISPLAY}): ${formattedDateForEmail}`.yellow);

  let categoryDetails = "";
  if (expensesByCategory && expensesByCategory.length > 0) {
    categoryDetails = expensesByCategory
      .map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`)
      .join('');
  } else {
    categoryDetails = `<li>No expenses recorded for ${formattedDateForEmail}.</li>`; // Use formatted date
  }

  const subject = `Your Daily Expense Report – ₹${totalSpentToday.toFixed(2)} Spent on ${formattedDateForEmail}`; // Use formatted date
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Daily Expense Report - ${formattedDateForEmail}</h2>
        <p>Hi ${user.name || 'User'},</p>
        <p>For ${formattedDateForEmail}, you spent a total of <strong>₹${totalSpentToday.toFixed(2)}</strong>.</p>
        ${expensesByCategory && expensesByCategory.length > 0 ? `
        <p>Here's a breakdown by category:</p>
        <ul>
          ${categoryDetails}
        </ul>` : `<p>No expenses were logged for this day.</p>`}
        <p>Track more at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard">FinTrack Pro</a>.</p>
        <hr>
        <p><small>If you wish to stop receiving these daily reports, you can update your preferences in your FinTrack Pro profile settings.</small></p>
      </body>
    </html>
  `;
  // Ensure your textBody also uses formattedDateForEmail
  const textBody = `
    Daily Expense Report - ${formattedDateForEmail}\n
    Hi ${user.name || 'User'},\n
    For ${formattedDateForEmail}, you spent a total of ₹${totalSpentToday.toFixed(2)}.\n
    ${expensesByCategory && expensesByCategory.length > 0 ? `Breakdown:\n${expensesByCategory.map(cat => `- ${cat.categoryName}: ₹${cat.totalSpent.toFixed(2)}`).join('\n')}` : 'No expenses logged for this day.'}\n
    Track more at FinTrack Pro: ${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard\n
    To unsubscribe, update your profile settings.
  `;

  console.log(`Attempting to send daily report to ${user.email} for date ${formattedDateForEmail} using hardcoded config...`.blue);
  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});

export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
    if (!user.emailPreferences.monthlyReport || !user.email) {
        console.log(`Skipping monthly report for ${user.email || user._id}: user opted out or no email.`.gray);
        return;
    }
    const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;
    // monthName and year are already correctly derived in TARGET_TIMEZONE by scheduler.service.js using moment.format()

    let categoryDetails = "";
    if (topSpendingCategories && topSpendingCategories.length > 0) {
      categoryDetails = topSpendingCategories
        .map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`)
        .join('');
    } else {
      categoryDetails = "<li>No expenses recorded this month.</li>";
    }
    let suggestionsHtml = "";
    if (suggestions && suggestions.length > 0) {
      suggestionsHtml = `<p><strong>Suggestions for next month:</strong></p><ul>${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
    }
    const subject = `Your Monthly Financial Overview for ${monthName} ${year}`;
    const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Monthly Financial Overview - ${monthName} ${year}</h2>
        <p>Hi ${user.name || 'User'},</p>
        <p>Here's your financial summary for ${monthName} ${year}:</p>
        <ul>
          <li><strong>Total Income:</strong> ₹${totalIncome.toFixed(2)}</li>
          <li><strong>Total Expenses:</strong> ₹${totalExpense.toFixed(2)}</li>
          <li><strong>Net Savings:</strong> ₹${netSavings.toFixed(2)} (${netSavings >= 0 ? 'Saved' : 'Overspent'})</li>
        </ul>
        ${topSpendingCategories && topSpendingCategories.length > 0 ? `
        <p><strong>Your top spending categories were:</strong></p>
        <ul>
          ${categoryDetails}
        </ul>` : '<p>No expenses logged this month.</p>'}
        ${suggestionsHtml}
        <p>Review your finances in detail at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard">FinTrack Pro</a>.</p>
        <hr>
        <p><small>To manage your email preferences, please visit your profile settings on FinTrack Pro.</small></p>
      </body>
    </html>`; // (Ensure your HTML body is complete)


    console.log(`Attempting to send monthly overview to ${user.email} for ${monthName} ${year} using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody,
        text: `Monthly Overview for ${monthName} ${year}...\nTotal Income: ${totalIncome.toFixed(2)}\nTotal Expense: ${totalExpense.toFixed(2)}\nNet Savings: ${netSavings.toFixed(2)}` // Simplified text
    });
});

export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
    if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) {
        console.log(`Skipping budget alert for ${user.email || user._id} on budget "${budget.name || 'Unnamed Budget'}": user/budget opted out or no email.`.gray);
        return;
    }
    
    const budgetName = budget.name || (budget.category ? (budget.category.name || "A category") + " Budget" : "Overall Budget");
    // Format the budget.startDate for display in TARGET_TIMEZONE
    const budgetStartDateObject = new Date(budget.startDate);
    const budgetStartDateFormatted = budgetStartDateObject.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        timeZone: TARGET_TIMEZONE_FOR_DISPLAY
    });

    const subject = `⚠️ Budget Alert: You've spent ${percentage}% of your ${budgetName}!`;
    const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Budget Alert!</h2>
        <p>Hi ${user.name || 'User'},</p>
        <p>This is an alert regarding your budget: <strong>"${budgetName}"</strong>.</p>
        <p>You have spent <strong>₹${totalSpent.toFixed(2)}</strong> of your allocated <strong>₹${budget.amount.toFixed(2)}</strong>.
        This is <strong>${percentage}%</strong> of your budget for the current period (starting ${budgetStartDateFormatted}).</p>
        ${percentage >= 100 ? "<p><strong>You have exceeded this budget.</strong></p>" : ""}
        <p>Consider reviewing your spending to stay on track.</p>
        <p>Manage your budgets at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/budget">FinTrack Pro Budgets</a>.</p>
        <hr>
        <p><small>You can disable these alerts in your budget settings or profile preferences on FinTrack Pro.</small></p>
      </body>
    </html>`; // (Ensure your HTML body is complete)

    console.log(`Attempting to send budget alert to ${user.email} for budget "${budgetName}" using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody,
        text: `Budget Alert: ${percentage}% of ${budgetName} spent... (Period starting ${budgetStartDateFormatted})`
    });
});

export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
    const subject = 'Password Reset Request for FinTrack Pro';
    const htmlBody = `
        <p>Hi ${user.name || 'User'},</p>
        <p>You requested a password reset for your FinTrack Pro account.</p>
        <p>Please click on the following link, or paste it into your browser to complete the process:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 10 minutes.</p>
    `; // (Ensure your HTML body is complete)
    const textBody = `Password Reset for FinTrack Pro. Visit ${resetUrl} to reset. Link expires in 10 mins. If not you, ignore this.`;

    console.log(`Attempting to send password reset to ${user.email} using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody,
        text: textBody,
    });
});

// export default sendEmail; // Only if needed