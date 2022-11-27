import bcrypt from 'bcryptjs';
import { Strategy as JWTStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { getAppEnvVar } from './env';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { NextFunction } from 'express';
import { log } from '../logger/log';
import { Forbidden, Unauthorized } from './errors';
import { getDb } from '../db/client';

const SECRET = getAppEnvVar('ACCESS_TOKEN_SECRET');
const SALT = 10;

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

const ADMIN_ID = 1;

export type UserPayload = {
  id: number;
};

passport.use(
  new JWTStrategy(options, async (payload: UserPayload, done) => {
    try {
      const user = await getDb().access.users.select(payload.id);
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
      log.info(`User ${user?.id}:${user?.name}`);
    }
    next();
  },
];

export type Predicate = (user: User, idParam: number) => Promise<boolean>;

const userHasAccess = (predicate: Predicate) => {
  return async (req: any, _: any, next: NextFunction) => {
    const user = req.user as User | null;
    if (user) {
      if (user.id === ADMIN_ID) {
        return next();
      }

      const id = Number.parseInt(req.params.id, 10);
      try {
        if (await predicate(user as User, id)) {
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

const onlyAdmin = async () => false;

export default {
  hash: createHash,
  match,
  passport,
  jwt: jwtSign,
  required,
  userHasAccess,
  onlyAdmin,
};
