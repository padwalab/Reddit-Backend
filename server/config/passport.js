import { Strategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './config/.env' });

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

export default (passport) => {
  passport.use(
    new Strategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.user.id).select([
          '-password',
          '-date',
          '-communities',
          '-messages',
        ]);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        console.log(error);
      }
    })
  );
};
