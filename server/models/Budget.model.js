import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { // e.g., "Monthly Food Budget", "Overall Spending Limit"
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
    },
    category: {
      // If null, it's a global monthly/yearly budget for all expenses
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget amount must be at least 1'],
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly', 'custom'], // 'custom' could use startDate & endDate
      default: 'monthly',
      required: true,
    },
    startDate: { // Defines the start of the budget period
      type: Date,
      required: true,
      default: () => new Date(new Date().setDate(1)) // Default to start of current month
    },
    endDate: { // For 'custom' period or if 'monthly'/'yearly' needs specific end
      type: Date,
      // Validation: endDate must be after startDate
      validate: [
        {
          validator: function(value) {
            // Only validate if endDate is provided
            return !value || this.startDate <= value;
          },
          message: 'End date must be after start date.'
        }
      ]
    },
    // To avoid re-calculating spent amount constantly, you could store it here
    // and update it via a cron job or transaction hooks.
    // currentSpent: {
    //   type: Number,
    //   default: 0
    // },
    notificationsEnabled: { // For budget breach alerts
        type: Boolean,
        default: true
    }
  },
  {
    timestamps: true,
    // To ensure budget names are unique per user and period (if needed)
    // or category per user and period
    // indexes: [
    //   { fields: { user: 1, category: 1, period: 1, startDate: 1 }, unique: true, partialFilterExpression: { category: { $ne: null } } },
    //   { fields: { user: 1, name: 1, period: 1, startDate: 1 }, unique: true, partialFilterExpression: { category: null } } // For global budgets
    // ]
  }
);

// Ensure a user doesn't have overlapping budgets for the same category/period
// This is complex and might be better handled at the application logic layer
// or with more specific indexing.
// For now, we'll rely on frontend validation and careful creation.


const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;