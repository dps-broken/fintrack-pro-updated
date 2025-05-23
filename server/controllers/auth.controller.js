// server/controllers/auth.controller.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import colors from 'colors';
import { jwtConfig } from '../config/jwt.config.js'; // <<<--- IMPORT HARDCODED CONFIG

// const JWT_SECRET = process.env.JWT_SECRET; // NO LONGER USING ENV HERE
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN; // NO LONGER USING ENV HERE

// Generate JWT
const generateToken = (id) => {
  if (!jwtConfig.secret) { // Check the imported config
    console.error('FATAL ERROR: jwtConfig.secret is missing! Check jwt.config.js.'.red.bold);
    throw new Error('JWT secret is missing from centralized config; critical error.');
  }
  if (!id) {
    console.error('FATAL ERROR: Attempted to generate token without a user ID.'.red.bold);
    throw new Error('User ID is required to generate a token.');
  }

  return jwt.sign({ id }, jwtConfig.secret, { // Use jwtConfig.secret
    expiresIn: jwtConfig.expiresIn || '1d',   // Use jwtConfig.expiresIn
  });
};

// ... (REST OF THE registerUser, loginUser, getMe, logoutUser functions remain the same)
// (No changes needed inside them as they call the generateToken above)

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  console.log('Register attempt received with body:'.blue, req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password.');
  }

  const lowercasedEmail = email.toLowerCase();
  const userExists = await User.findOne({ email: lowercasedEmail });

  if (userExists) {
    console.warn(`Registration failed: User already exists with email ${lowercasedEmail}`.yellow);
    res.status(400);
    throw new Error('User already exists with this email.');
  }

  console.log(`Creating new user with email: ${lowercasedEmail}`.blue);
  let user;
  try {
    user = await User.create({
        name,
        email: lowercasedEmail,
        password, 
    });
  } catch (creationError) {
      console.error('Error during User.create in registerUser:'.red, creationError);
      if (creationError.name === 'ValidationError') {
          res.status(400);
          const messages = Object.values(creationError.errors).map(val => val.message).join(', ');
          throw new Error(`Registration data invalid: ${messages}`);
      }
      res.status(500);
      throw new Error('User registration failed due to a server error.');
  }

  if (user) {
    console.log(`User ${user.email} created successfully. Generating token...`.green);
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
      emailPreferences: user.emailPreferences,
      token: token,
    });
  } else {
    console.error('User creation finished but user object is unexpectedly null.'.red);
    res.status(500);
    throw new Error('User registration failed unexpectedly after creation attempt.');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  console.log('Login attempt received with body:'.blue, req.body);

  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    console.warn('Login attempt failed: Email not provided or not a string.'.yellow);
    res.status(400);
    throw new Error('Email is required.');
  }
  if (!password || typeof password !== 'string' || password === '') {
    console.warn('Login attempt failed: Password not provided or not a string.'.yellow);
    res.status(400);
    throw new Error('Password is required.');
  }

  const lowercasedEmail = email.toLowerCase();
  console.log(`Attempting to find user with email: ${lowercasedEmail}`.blue);

  let user;
  try {
    user = await User.findOne({ email: lowercasedEmail }).select('+password');
  } catch (dbError) {
    console.error('CRITICAL: Error during User.findOne in login:'.red, dbError);
    res.status(500); 
    throw new Error('A server error occurred while trying to retrieve user data. Please try again later.');
  }

  if (!user) {
    console.warn(`Login attempt failed: No user found for email ${lowercasedEmail}`.yellow);
    res.status(401); 
    throw new Error('Invalid email or password.');
  }

  console.log(`User found: ${user.email}. Comparing password...`.blue);
  let passwordsMatch = false;
  try {
    passwordsMatch = await user.matchPassword(password);
  } catch (bcryptOrModelError) {
    console.error('CRITICAL: Error during password comparison (matchPassword method):'.red, bcryptOrModelError);
    res.status(500);
    throw new Error('A server error occurred during the authentication process.');
  }

  if (passwordsMatch) {
    console.log(`Password match for user: ${user.email}. Generating token...`.green);
    let token;
    try {
      token = generateToken(user._id); 
    } catch (tokenError) {
      console.error('CRITICAL: Error generating JWT token (using jwt.config.js):'.red, tokenError.message);
      throw tokenError; 
    }

    console.log(`Token generated successfully for user: ${user.email}`.green);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
      emailPreferences: user.emailPreferences,
      token: token,
    });
  } else {
    console.warn(`Login attempt failed: Password mismatch for email ${lowercasedEmail}`.yellow);
    res.status(401); 
    throw new Error('Invalid email or password.');
  }
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    console.error('getMe controller called without authenticated user or user ID on req object.'.red);
    res.status(401); 
    throw new Error('Not authorized, user data missing from request.');
  }
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
      emailPreferences: user.emailPreferences,
      createdAt: user.createdAt,
    });
  } else {
    console.warn(`User with ID ${req.user._id} from token not found in database.`.yellow);
    res.status(404); 
    throw new Error('User not found.');
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log('Logout request received.'.blue);
  res.status(200).json({ message: 'User logged out successfully.' });
});

export {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};