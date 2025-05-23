import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // null for predefined categories, user ID for custom categories
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Category type (income/expense) is required'],
    },
    icon: {
      type: String, // e.g., 'FaMoneyBillWave', 'FaShoppingCart' (FontAwesome class names)
      default: 'FaQuestionCircle', // Default icon
    },
    isPredefined: {
      type: Boolean,
      default: false,
    },
    color: { // Optional: for chart visualizations
      type: String,
      default: '#CCCCCC' // A default color
    }
  },
  {
    timestamps: true,
  }
);

// Ensure category name is unique per user (or globally for predefined)
// For custom categories, name + user + type should be unique
categorySchema.index({ name: 1, user: 1, type: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });
// For predefined categories, name + type should be unique
categorySchema.index({ name: 1, type: 1 }, { unique: true, partialFilterExpression: { user: { $exists: false } } });


const Category = mongoose.model('Category', categorySchema);

export default Category;