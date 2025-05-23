// server/server.js

// --- DOTENV CONFIGURATION (SIMPLIFIED FOR THIS DEBUGGING STEP) ---
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// import colors from 'colors'; // colors is imported below, ensure it's available for logs

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env for OTHER variables (MONGO_URI, EMAIL_*, etc.)
// We are assuming JWT_SECRET will be hardcoded via jwt.config.js for this test
const envConfigPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.config({ path: envConfigPath });
// --- END DOTENV CONFIGURATION ---


import express from 'express';
import colors from 'colors'; // Import colors here
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './config/passport.js';

// Configs
import connectDB from './config/db.js'; // MONGO_URI from .env is still needed here
import { initializeScheduler } from './services/scheduler.service.js';

// Middleware
import { errorHandler, notFound } from './middleware/errorHandler.middleware.js';

// Routes
// ... (your route imports)
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes from './routes/category.routes.js';
import goalRoutes from './routes/goal.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';


// Check if MONGO_URI is loaded - crucial for DB connection
if (!process.env.MONGO_URI) {
    console.error("CRITICAL: MONGO_URI is not loaded from .env. Database connection will fail.".red.bold);
} else {
    console.log("MONGO_URI seems to be loaded from .env.".green);
}

connectDB();

const app = express();

app.use(passport.initialize());
configurePassport(passport);

// ... (rest of server.js: cors, body-parser, routes, error handlers, app.listen)
// CORS Configuration
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: clientURL,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routers
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to FinTrack Pro API' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);

// Custom Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Initialize scheduled tasks
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) { // Check other env vars
    initializeScheduler();
} else {
    console.warn("Email credentials not fully set, scheduler for email reports might not function correctly.".yellow);
}

const PORT = process.env.PORT || 5001;

const serverInstance = app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
    );
    // The JWT_SECRET check here is less relevant now since it's hardcoded in jwt.config.js for this test
    // but it's good to know if other essential configs are missing.
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message || err}`.red.bold);
  console.error(err.stack);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception: '.red.bold, err.message);
    console.error(err.stack);
    if (serverInstance) { serverInstance.close(() => { process.exit(1); }); }
    else { process.exit(1); }
});