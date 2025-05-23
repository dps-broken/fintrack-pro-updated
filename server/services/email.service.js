// server/services/email.service.js
import nodemailer from 'nodemailer';
import asyncHandler from 'express-async-handler';
import colors from 'colors'; // Ensure colors is imported

// --- HARDCODED EMAIL DETAILS - FOR DEBUGGING ONLY ---
// --- REMOVE THESE AND USE process.env FOR PRODUCTION ---
// --- Replace with your actual credentials for testing ---
const EMAIL_HOST_HARDCODED = "smtp.gmail.com";
const EMAIL_PORT_HARDCODED = 587; // Use number, not string
const EMAIL_SECURE_HARDCODED = false; // boolean: true for 465, false for 587 (TLS)
const EMAIL_USER_HARDCODED = "dwivedipranjal1234567@gmail.com"; // Your actual email
const EMAIL_PASS_HARDCODED = "sqzqjofmjpdgmljo"; // Your actual (App) Password
const EMAIL_FROM_NAME_HARDCODED = "FinTrack Pro";
const EMAIL_FROM_ADDRESS_HARDCODED = "dwivedipranjal1234567@gmail.com"; // Can be same as user or a no-reply
// --- END HARDCODED EMAIL DETAILS ---

// const EMAIL_HOST = process.env.EMAIL_HOST; // Original
// const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10); // Original
// const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'; // Original
// const EMAIL_USER = process.env.EMAIL_USER; // Original
// const EMAIL_PASS = process.env.EMAIL_PASS; // Original
// const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'FinTrack Pro'; // Original
// const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@fintrackpro.com'; // Original

let transporter;

console.log("Email Service: Using HARDCODED email credentials for debugging.".magenta.bold);
if (EMAIL_PASS_HARDCODED === "YOUR_ACTUAL_GMAIL_APP_PASSWORD_HERE") {
    console.warn(
        "\n*********************************************************************\n".yellow +
        "WARNING: Placeholder EMAIL_PASS_HARDCODED in email.service.js!".yellow.bold +
        "\nREPLACE IT WITH YOUR REAL (APP) PASSWORD FOR TESTING.".yellow.bold +
        "\n*********************************************************************\n".yellow
    );
}


// Check if the hardcoded essential variables are present
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
          // Setting to false can help with some self-signed cert issues in dev,
          // but for Gmail, it should generally not be needed.
          // rejectUnauthorized: false // Use with extreme caution, not for production with Gmail
      }
    });

    // Verify connection configuration
    // You can remove the verify call if it's causing issues during startup,
    // but it's good for confirming transporter setup.
    transporter.verify((error, success) => {
      if (error) {
          console.error('Error configuring email transporter (verify failed - hardcoded):'.red, error.message);
          console.warn('Email services might still not be available even with hardcoded values.'.yellow);
          transporter = null; // Ensure transporter is null if verify fails
      } else {
          console.log('Email transporter configured successfully. Server is ready to send emails.'.green);
      }
    });

  } catch (initError) {
      console.error('Error initializing Nodemailer transporter with hardcoded values:'.red, initError);
      transporter = null; // Ensure transporter is null if createTransport fails
  }
} else {
  console.error('CRITICAL: One or more essential HARDCODED email variables (HOST, USER, PASS) are missing or empty. Email sending will be disabled.'.red.bold);
  transporter = null; // Ensure transporter is null
}


const sendEmail = asyncHandler(async (options) => {
  if (!transporter) {
    console.error('Email transporter not initialized (hardcoded check). Cannot send email.'.red);
    // Optionally throw an error to make it more visible in the calling code
    // throw new Error('Email service is not configured or transporter failed to initialize.');
    return; // Silently fail or throw, depending on desired behavior
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
    console.error("Full Nodemailer send error:".red, error); // Log the full error object
    throw error; // Re-throw so calling function knows it failed
  }
});

// --- Specific Email Templates/Functions (sendDailyExpenseReport, etc.) ---
// These functions will now use the sendEmail function above, which uses hardcoded details.
// No changes needed to the content of these functions themselves, only how sendEmail gets its config.

export const sendDailyExpenseReport = asyncHandler(async (user, reportData) => {
  if (!user.emailPreferences.dailyReport || !user.email) {
      console.log(`Skipping daily report for ${user.email}: user opted out or no email.`.gray);
      return;
  }

  // ... (rest of the function logic as before)
  const { totalSpentToday, expensesByCategory, date } = reportData;
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let categoryDetails = "";
  if (expensesByCategory && expensesByCategory.length > 0) {
    categoryDetails = expensesByCategory
      .map(cat => `<li>${cat.categoryName || 'Uncategorized'}: ₹${cat.totalSpent.toFixed(2)}</li>`)
      .join('');
  } else {
    categoryDetails = "<li>No expenses recorded today.</li>";
  }

  const subject = `Your Daily Expense Report – ₹${totalSpentToday.toFixed(2)} Spent Today (${formattedDate})`;
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Daily Expense Report - ${formattedDate}</h2>
        <p>Hi ${user.name || 'User'},</p>
        <p>Today, you spent a total of <strong>₹${totalSpentToday.toFixed(2)}</strong>.</p>
        ${expensesByCategory && expensesByCategory.length > 0 ? `
        <p>Here's a breakdown by category:</p>
        <ul>
          ${categoryDetails}
        </ul>` : '<p>No expenses were logged today. Keep up the good work if you were aiming for a zero-spend day!</p>'}
        <p>Track more at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard">FinTrack Pro</a>.</p>
        <hr>
        <p><small>If you wish to stop receiving these daily reports, you can update your preferences in your FinTrack Pro profile settings.</small></p>
      </body>
    </html>
  `;
  const textBody = `...`; // (Keep your text body)


  console.log(`Attempting to send daily report to ${user.email} using hardcoded config...`.blue);
  await sendEmail({
    to: user.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
});

export const sendMonthlyOverviewReport = asyncHandler(async (user, reportData) => {
    if (!user.emailPreferences.monthlyReport || !user.email) {
        console.log(`Skipping monthly report for ${user.email}: user opted out or no email.`.gray);
        return;
    }
    // ... (rest of the function logic as before) ...
    const { monthName, year, totalIncome, totalExpense, netSavings, topSpendingCategories, suggestions } = reportData;
    // ... (construct subject, htmlBody, textBody)
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
    const htmlBody = `...`; // (Keep your HTML body)


    console.log(`Attempting to send monthly overview to ${user.email} using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody, // Add your full HTML
        text: `Monthly Overview for ${monthName} ${year}...`
    });
});

export const sendBudgetBreachAlert = asyncHandler(async (user, budget, totalSpent, percentage) => {
    if (!user.emailPreferences.budgetAlerts || !user.email || !budget.notificationsEnabled) {
        console.log(`Skipping budget alert for ${user.email} on budget "${budget.name}": user/budget opted out or no email.`.gray);
        return;
    }
    // ... (rest of the function logic as before) ...
    const budgetName = budget.name || (budget.category ? budget.category.name + " Budget" : "Overall Budget");
    const subject = `⚠️ Budget Alert: You've spent ${percentage}% of your ${budgetName}!`;
    const htmlBody = `...`; // (Keep your HTML body)


    console.log(`Attempting to send budget alert to ${user.email} for budget "${budgetName}" using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody, // Add your full HTML
        text: `Budget Alert: ${percentage}% of ${budgetName} spent...`
    });
});

export const sendPasswordResetEmail = asyncHandler(async (user, resetUrl) => {
    // ... (rest of the function logic as before) ...
    const subject = 'Password Reset Request for FinTrack Pro';
    const htmlBody = `...`; // (Keep your HTML body)
    const textBody = `...`;

    console.log(`Attempting to send password reset to ${user.email} using hardcoded config...`.blue);
    await sendEmail({
        to: user.email,
        subject,
        html: htmlBody,
        text: textBody,
    });
});


// Export the generic sendEmail function as default if other parts of your app might use it directly
// export default sendEmail; // Not strictly needed if only the specific report functions are exported and used.