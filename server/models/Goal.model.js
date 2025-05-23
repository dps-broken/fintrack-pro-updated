import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    currentAmount: { // This could be manually updated or calculated based on contributions
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.targetAmount;
        },
        message: 'Current amount cannot exceed target amount',
      },
    },
    deadline: {
      type: Date,
      // Optional: No specific validation here, but could be added
    },
    description: { // Optional
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isAchieved: {
      type: Boolean,
      default: false,
    },
    // Optional: Link transactions that contribute to this goal
    // contributions: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Transaction'
    // }]
  },
  {
    timestamps: true,
  }
);

// Virtual for progress percentage
goalSchema.virtual('progress').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, (this.currentAmount / this.targetAmount) * 100);
});

// Update isAchieved status before saving
goalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount) {
    this.isAchieved = true;
  } else {
    this.isAchieved = false;
  }
  next();
});


const Goal = mongoose.model('Goal', goalSchema);

export default Goal;