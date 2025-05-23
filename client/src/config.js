// client/src/config.js

// API Configuration (already handled by .env and apiClient.js, but could be an alternative place)
// export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Feature Flags (example)
export const FEATURE_FLAGS = {
  enableAdvancedAnalytics: true,
  showBetaFeatures: false,
  // Add more flags as your application grows
};

// UI Settings & Constants
export const UI_SETTINGS = {
  defaultPageLimit: 10, // Default items per page for lists
  toastDuration: 5000, // Default duration for toast notifications in ms
  maxFileUploadSize: 5 * 1024 * 1024, // 5MB for example
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
};

// Date & Time Formats
export const DATE_FORMATS = {
  short: 'MMM d, yyyy',         // e.g., Jan 1, 2023
  long: 'MMMM d, yyyy',         // e.g., January 1, 2023
  withTime: 'MMM d, yyyy h:mm a', // e.g., Jan 1, 2023 5:30 PM
  iso: 'yyyy-MM-dd',            // e.g., 2023-01-01
};

// Charting Constants (example)
export const CHART_DEFAULTS = {
  defaultAnimationDuration: 1000, // ms
  maxDataPointsForDailyTrend: 30, // Max days to show without aggregation
};

// Default messages or text snippets (can also be in a i18n solution)
export const MESSAGES = {
  genericError: "An unexpected error occurred. Please try again later.",
  networkError: "A network error occurred. Please check your connection.",
  loading: "Loading...",
};


// Combine all configs into a single export if preferred
const config = {
  // API_BASE_URL,
  FEATURE_FLAGS,
  UI_SETTINGS,
  DATE_FORMATS,
  CHART_DEFAULTS,
  MESSAGES,
};

export default config;

// How to use:
// import config, { FEATURE_FLAGS, UI_SETTINGS } from './config';
// console.log(config.UI_SETTINGS.defaultPageLimit);
// if (FEATURE_FLAGS.enableAdvancedAnalytics) { /* ... */ }