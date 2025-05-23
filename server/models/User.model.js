// server/models/User.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'], // Mongoose validation message
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      unique: true, // This will throw a MongoDB duplicate key error (E11000) if not unique
      lowercase: true, // Ensures email is stored in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false,
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    emailPreferences: {
      dailyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;