import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type (income/expense) is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Transaction category is required'],
    },
    sourceDestination: {
      // e.g., "Salary", "Swiggy", "Freelance Client X", "Groceries Store"
      type: String,
      trim: true,
      required: [true, 'Source/Destination is required'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Transaction date is required'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;