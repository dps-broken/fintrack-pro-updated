// server/middleware/auth.middleware.js
import passport from 'passport';
import colors from 'colors'; // For console coloring

// Middleware to protect routes using Passport JWT strategy
const protect = (req, res, next) => {
  // 'jwt' refers to the name of the strategy configured in passport.js
  // { session: false } tells Passport not to create or use sessions, as we are using tokens.
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    // This callback function is executed after Passport tries to authenticate.
    // err: An error from the strategy's verify callback (e.g., database error).
    // user: The user object if authentication succeeded (from done(null, user)), or false if failed.
    // info: An optional info object, often contains error messages (e.g., from done(null, false, { message: ... }) or passport-jwt internal messages).

    if (err) {
      console.error('Passport Authentication Strategy Error (in protect middleware):'.red, err);
      // This is likely a server-side error (e.g., database connection issue during user lookup)
      return res.status(500).json({ message: 'Authentication error on server.' });
    }

    if (!user) {
      // Authentication failed (token invalid, expired, user not found, or no token provided)
      let authMessage = 'Unauthorized. Access denied.';
      if (info && info.message) {
        // Use message from passport-jwt (e.g., "No auth token", "jwt expired") or our custom ones ("User not found.")
        authMessage = `Unauthorized: ${info.message}`;
      } else if (info && typeof info === 'object' && Object.keys(info).length > 0) {
        // Sometimes info is an error object itself
        authMessage = `Unauthorized: ${info.name || 'Invalid token data.'}`;
      }
      console.warn('Passport Authentication Failed (in protect middleware):'.yellow, authMessage);
      return res.status(401).json({ message: authMessage });
    }

    // Authentication successful!
    // Passport attaches the authenticated user to req.user.
    req.user = user;
    // console.log('Passport Authentication Successful. req.user set:'.green, req.user.email);
    next(); // Proceed to the next middleware or route handler
  })(req, res, next); // This invokes the middleware returned by passport.authenticate
};


// Admin middleware remains the same conceptually
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) { // Assuming an isAdmin field on the User model
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized as an admin. Access restricted.');
  }
};

export { protect, admin };