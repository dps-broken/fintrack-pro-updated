// server/config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.model.js';
import colors from 'colors';
import { jwtConfig } from './jwt.config.js'; // <<<--- IMPORT HARDCODED CONFIG

// const JWT_SECRET = process.env.JWT_SECRET; // NO LONGER USING ENV HERE

if (!jwtConfig.secret) { // Check the imported config
  console.error(
    'FATAL ERROR: jwtConfig.secret is missing for Passport configuration! Check jwt.config.js.'.red.bold
  );
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtConfig.secret, // <<<--- USE FROM IMPORTED CONFIG
};

export default function(passportInstance) {
  console.log("Attempting to configure Passport JWT strategy (using jwt.config.js)...".cyan);
  if (!jwtConfig.secret) {
    console.warn("Passport JWT strategy CANNOT be configured due to missing jwtConfig.secret.".yellow.bold);
    return;
  }

  passportInstance.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      // console.log('Passport JWT Strategy - Payload received:'.blue, jwt_payload);
      try {
        const user = await User.findById(jwt_payload.id).select('-password');
        if (user) {
          return done(null, user);
        } else {
          console.warn(`Passport JWT: User with ID ${jwt_payload.id} not found.`.yellow);
          return done(null, false, { message: 'User not found.' });
        }
      } catch (error) {
        console.error('Error in Passport JWT strategy:'.red, error);
        return done(error, false, { message: 'Server error during authentication.'});
      }
    })
  );
  console.log('Passport JWT strategy configured successfully (using jwt.config.js).'.green);
}