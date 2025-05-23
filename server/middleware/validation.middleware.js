// server/middleware/validation.middleware.js
import { body, validationResult } from 'express-validator';

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // This is where the 400 response with detailed errors is sent
    return res.status(400).json({
      message: 'Validation failed. Please check your input.', // General message
      errors: errors.array(), // Array of specific field errors
    });
  }
  next();
};

// User Registration Validation
export const registerUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  // IMPORTANT: handleValidationErrors must be the last middleware in this chain
  handleValidationErrors,
];

// Transaction Creation Validation
export const createTransactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isNumeric().withMessage('Amount must be a number').toFloat().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('sourceDestination').notEmpty().withMessage('Source/Destination is required').trim(),
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters').trim(),
  handleValidationErrors,
];

// Category Creation Validation
export const createCategoryValidation = [
    body('name').notEmpty().withMessage('Category name is required').trim(),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('icon').optional().trim(),
    body('color').optional().isHexColor().withMessage('Invalid color hex code'),
    handleValidationErrors,
];

// Goal Creation Validation
export const createGoalValidation = [
    body('name').notEmpty().withMessage('Goal name is required').trim(),
    body('targetAmount').isNumeric().withMessage('Target amount must be a number').toFloat().isFloat({ gt: 0 }).withMessage('Target amount must be greater than 0'),
    body('currentAmount').optional().isNumeric().toFloat().isFloat({ gte: 0 }),
    body('deadline').optional().isISO8601().toDate().withMessage('Invalid date format for deadline'),
    body('description').optional().isLength({ max: 500 }).trim(),
    handleValidationErrors,
];

// Budget Creation Validation
export const createBudgetValidation = [
    body('name').notEmpty().withMessage('Budget name is required').trim(),
    body('category').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid category ID for budget'),
    body('amount').isNumeric().toFloat().isFloat({ gt: 0 }).withMessage('Budget amount must be greater than 0'),
    body('period').isIn(['monthly', 'yearly', 'custom']).withMessage('Invalid budget period'),
    body('startDate').isISO8601().toDate().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format')
        .custom((value, { req }) => {
            if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
                throw new Error('End date must not be before start date');
            }
            return true;
        }),
    body('notificationsEnabled').optional().isBoolean(),
    handleValidationErrors,
];

// You can also export handleValidationErrors if needed elsewhere, but typically it's used within these chains.
// export { handleValidationErrors };