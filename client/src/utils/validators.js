// client/src/utils/validators.js

/**
 * Checks if a value is empty (null, undefined, or empty string after trimming).
 * @param {*} value - The value to check.
 * @returns {boolean} True if empty, false otherwise.
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
};

/**
 * Validates an email address format.
 * @param {string} email - The email string to validate.
 * @returns {boolean} True if valid email format, false otherwise.
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false;
  // Basic regex for email validation, can be more comprehensive
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength (example: min length).
 * @param {string} password - The password string.
 * @param {number} minLength - Minimum required length.
 * @returns {string | null} Error message string if invalid, null if valid.
 */
export const validatePassword = (password, minLength = 6) => {
  if (isEmpty(password)) return 'Password is required.';
  if (password.length < minLength) return `Password must be at least ${minLength} characters long.`;
  // Add more rules: e.g., uppercase, lowercase, number, special character
  // if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  // if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  // if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  // if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character.';
  return null; // Valid
};

/**
 * Checks if a value is a positive number.
 * @param {*} value - The value to check.
 * @returns {boolean} True if a positive number, false otherwise.
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Checks if a value is a number (integer or float).
 * @param {*} value - The value to check.
 * @returns {boolean} True if a number, false otherwise.
 */
export const isNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(value); // isFinite checks for Infinity and -Infinity
};


/**
 * Validates if a string is a valid hex color code.
 * @param {string} hexColor - The string to validate.
 * @returns {boolean} True if a valid hex color, false otherwise.
 */
export const isValidHexColor = (hexColor) => {
  if (isEmpty(hexColor)) return false;
  const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
  return hexRegex.test(hexColor);
};

/**
 * Validates if a date is not in the future.
 * @param {Date | string} dateInput - The date to check.
 * @returns {boolean} True if the date is today or in the past, false if in the future or invalid.
 */
export const isNotFutureDate = (dateInput) => {
    if (!dateInput) return false;
    const dateToCheck = new Date(dateInput);
    if (isNaN(dateToCheck.getTime())) return false; // Invalid date

    const today = new Date();
    // Set time to 00:00:00 for accurate date comparison (ignoring time part for "today")
    // For checking if it's "not after today", we can compare directly
    // If we want to allow today, we need to set today's time to end of day or dateToCheck's time to start of day
    today.setHours(23, 59, 59, 999); // End of today

    return dateToCheck <= today;
};


/**
 * Validates if an end date is after or the same as a start date.
 * @param {Date | string | null} startDateInput - The start date.
 * @param {Date | string | null} endDateInput - The end date.
 * @returns {boolean} True if valid range or if endDate is null, false otherwise.
 */
export const isValidDateRange = (startDateInput, endDateInput) => {
    if (!endDateInput) return true; // End date is optional, valid if not provided
    if (!startDateInput) return false; // If end date is there, start date must be too

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false; // Invalid date(s)

    return endDate >= startDate;
};


// Example of using these in a Yup custom validation:
/*
Yup.string()
  .test(
    'is-valid-password',
    (value) => validatePassword(value) || 'Invalid password format', // Use error message from validator or a default
    (value) => validatePassword(value) === null
  )
*/

// You can export an object containing all validators for easier import
const validators = {
  isEmpty,
  isValidEmail,
  validatePassword,
  isPositiveNumber,
  isNumber,
  isValidHexColor,
  isNotFutureDate,
  isValidDateRange,
};

export default validators;