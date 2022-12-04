import { Router, Response, NextFunction, Request } from 'express';
import { TRequest as TRequest } from '../utils/types';
import { BadRequest, NoSuchResource } from '../utils/errors';
import auth from '../utils/auth';
import { throwIfNotValid, validAuthBody } from '../validation/schema';
import { db } from '../db/Database';
import { PublicUser } from '../db/UserClient';
import { log } from '../logger/log';

const router = Router();

type AuthBody = {
  email: string;
  password: string;
};

const BEARER_REGEX = /^Bearer (.*)$/;

router.post(
  '/login',
  validAuthBody,
  async (req: TRequest<AuthBody>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/userWithToken'}
    } */
    try {
      throwIfNotValid(req);
      const user = await db().users.selectByEmailSecret(req.body.email);
      if (!user) {
        throw new NoSuchResource('user');
      }
      if (!(await auth.match(req.body.password, user.password))) {
        throw new BadRequest('Incorrect password');
      }
      const { password, ...result } = user;
      const token = auth.jwt({ id: user.id, role: user.role.id });

      log.info(`SUCCESS - User ${user.id} logged in with password`);
      res.json({ ...result, token });
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

router.post(
  '/login/token',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/userWithToken'}
    } */
    try {
      let token = '';
      const bearer = req.headers.authorization?.match(BEARER_REGEX);
      if (bearer && bearer[1]) {
        const jwt = bearer[1];
        log.debug(jwt);
        token = jwt;
      }

      const user: PublicUser | null = req.user as PublicUser;
      if (user && token) {
        log.info(`SUCCESS - User ${user.id} logged in with JWT`);
        return res.json({ token, ...user });
      } else {
        throw new BadRequest('Invalid or expired token');
      }
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { router as router };
