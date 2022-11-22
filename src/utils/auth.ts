import bcrypt from 'bcryptjs';
import { Strategy as JWTStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { getAppEnvVar } from './env';
import { db } from '../db/context';
import usersClient, { PublicUser } from '../db/users';
import passport, { AuthenticateOptions } from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { NextFunction } from 'express';
import { log } from '../logger/log';
import { Forbidden, Unauthorized } from './errors';

const SECRET = getAppEnvVar('ACCESS_TOKEN_SECRET');
const SALT = 10;

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

export type UserPayload = {
  id: number;
};

passport.use(
  new JWTStrategy(options, async (payload: UserPayload, done) => {
    try {
      const user = await usersClient.select(payload.id, db);
      return done(null, user);
    } catch (err) {
      return done(new Unauthorized());
    }
  })
);

const jwtSign = (object: any) => jwt.sign(object, SECRET);

const hash = async (password: string) => {
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

const sameUser = [
  ...required,
  (req: any, _: any, next: NextFunction) => {
    const user = req.user as User | null;
    if (user !== null) {
      const id = Number.parseInt(req.params.id);
      if (user.id !== id) {
        return next(new Forbidden());
      }
      return next();
    }
    next(new Forbidden());
  },
];

export type Predicate = (user: User, idParam: number) => Promise<boolean>;

const userOwns = (predicate: Predicate) => {
  return async (req: any, _: any, next: NextFunction) => {
    const user = req.user as User | null;
    if (user) {
      const id = Number.parseInt(req.params.id);
      try {
        if (await predicate(user as User, id)) {
          return next();
        } else {
          return next(new Forbidden());
        }
      } catch (error) {
        next(error)
      }
    }
    next(new Forbidden());
  };
};

const admin = (req: any, _: any, next: NextFunction) => {
  const user = req.user as PublicUser;
  // TODO: check that user is admin
  log.warn('ADMIN CHECK IS NOT IMPLEMENTED!');
  next();
};

export default {
  hash,
  match,
  passport,
  jwt: jwtSign,
  required,
  sameUser,
  admin,
  userOwns,
};
