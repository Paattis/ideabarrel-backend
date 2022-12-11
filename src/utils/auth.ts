import bcrypt from 'bcryptjs';
import { Strategy as JWTStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { getAppEnvVar } from './env';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { NextFunction } from 'express';
import { log } from '../logger/log';
import { Forbidden, Unauthorized } from './errors';
import { db } from '../db/Database';
import { PublicUser } from '../db/UserClient';

const SECRET = getAppEnvVar('ACCESS_TOKEN_SECRET');
const SALT = 10;

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

const ADMIN_ID = 1;

/*interface User extends User {
  role: Role
}*/

passport.use(
  new JWTStrategy(options, async (payload: { id: number }, done) => {
    try {
      const user = await db().users.select(payload.id);
      return done(null, user);
    } catch (err) {
      return done(new Unauthorized());
    }
  })
);

const jwtSign = (object: any) => jwt.sign(object, SECRET);

const createHash = async (password: string) => {
  return await bcrypt.hash(password, SALT).then((it) => it);
};

const match = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

const required = [
  passport.authenticate('jwt', { session: false }),
  (req: any, _: any, next: NextFunction) => {
    const user = req.user as User | null;
    if (user !== null) {
      log.info(`Authenticated user  --  id:{${user?.id}} name:{${user?.name}}`);
    }
    next();
  },
];

export type Predicate = (user: PublicUser, idParam: number) => Promise<boolean>;

const userHasAccess = (predicate: Predicate) => {
  return async (req: any, _: any, next: NextFunction) => {
    const user = req.user as PublicUser | null;
    if (user) {
      if (user?.role?.id === ADMIN_ID) {
        return next();
      }

      const resource = Number.parseInt(req.params.resId, 10);
      try {
        if (await predicate(user, resource)) {
          return next();
        } else {
          return next(new Forbidden());
        }
      } catch (error) {
        next(error);
      }
    }
    next(new Forbidden());
  };
};

const onlyAdmin = async () => {
  return false;
};

export default {
  hash: createHash,
  match,
  passport,
  jwt: jwtSign,
  required,
  userHasAccess,
  onlyAdmin,
  ADMIN_ID,
};
