// server/config/index.js
import dotenv from 'dotenv';
dotenv.config(); // Ensure .env is loaded

export const {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
  NODE_ENV,
  CLIENT_URL, // Add CLIENT_URL here if you use it
} = process.env;

// You could also export functions or more complex config objects here
// e.g., export const mailConfig = { ... };