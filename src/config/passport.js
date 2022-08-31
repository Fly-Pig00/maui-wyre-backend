const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
//const GoogleStrategy = require('passport-google-oauth2').Strategy;
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};
passport.use(new JwtStrategy(jwtOptions, jwtVerify));

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//   done(null, user);
// });

// passport.use(new GoogleStrategy({
//   clientID: config.google.clientId, // Your Credentials here.
//   clientSecret: config.google.clientSecret, // Your Credentials here.
//   callbackURL: "http://localhost:4000/v1/auth/google/callback",
//   passReqToCallback: true
// },
//   async (request, accessToken, refreshToken, profile, done) => {
//     const email = profile.emails[0].value;
//     const currentUser = await User.findOne({ email });
//     if (!currentUser) {
//       return done(null, false, { message: "You did not registered." });
//     }
//     console.log("user profile is: ", profile);
//     return done(null, currentUser);
//   }
// ));


module.exports = async app => {
  app.use(passport.initialize());
  //app.use(passport.session());
};
