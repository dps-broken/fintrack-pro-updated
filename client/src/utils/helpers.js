// client/src/utils/helpers.js
import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string or Date object into a more readable format.
 * @param {string | Date} dateInput - The date to format.
 * @param {string} formatString - The desired date-fns format string.
 * @returns {string} Formatted date string, or 'Invalid Date' if input is bad.
 */
export const formatDate = (dateInput, formatString = 'MMM d, yyyy') => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  if (isValid(date)) {
    return format(date, formatString);
  }
  return 'Invalid Date';
};

/**
 * Formats a number as currency (INR by default).
 * @param {number} amount - The number to format.
 * @param {string} currency - Currency code (e.g., 'INR', 'USD').
 * @param {string} locale - Locale string (e.g., 'en-IN', 'en-US').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0.00'; // Or some other default/error indicator
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Generates a simple unique ID (for client-side temporary keys, not for DB).
 * @returns {string} A short unique string.
 */
export const generateClientSideId = () => {
  return Math.random().toString(36).substring(2, 9);
};


/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Simple debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Get contrasting text color for a given hex background color.
 * @param {string} hexColor - Background color in hex format (e.g., "#RRGGBB").
 * @returns {'#000000' | '#FFFFFF'} Black or White for best contrast.
 */
export const getContrastingTextColor = (hexColor) => {
    if (!hexColor || !/^#([0-9A-Fa-f]{3}){1,2}$/.test(hexColor)) {
        return '#000000'; // Default to black if invalid color
    }
    
    let r, g, b;
    if (hexColor.length === 4) { // #RGB format
        r = parseInt(hexColor[1] + hexColor[1], 16);
        g = parseInt(hexColor[2] + hexColor[2], 16);
        b = parseInt(hexColor[3] + hexColor[3], 16);
    } else { // #RRGGBB format
        r = parseInt(hexColor.slice(1, 3), 16);
        g = parseInt(hexColor.slice(3, 5), 16);
        b = parseInt(hexColor.slice(5, 7), 16);
    }
    
    // Formula for YIQ (luminance)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF'; // Black for light bg, White for dark bg
};

// Add other general utility functions here as needed...