import { Router, Response, NextFunction } from 'express';
import { TRequest as TRequest } from '../utils/types';
import { BadRequest, NoSuchResource } from '../utils/errors';
import auth from '../utils/auth';
import { throwIfNotValid, validAuthBody } from '../validation/schema';
import { getDb } from '../db/client';

const router = Router();

type AuthBody = {
  email: string;
  password: string;
};

router.post(
  '/login',
  validAuthBody,
  async (req: TRequest<AuthBody>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const user = await getDb().access.users.selectByEmailSecret(req.body.email);
      if (!user) {
        throw new NoSuchResource('user');
      }
      if (!(await auth.match(req.body.password, user.password))) {
        throw new BadRequest('Incorrect password');
      }
      const { password, ...result } = user;
      const token = auth.jwt({ id: user.id, role: user.role.id });
      res.json({ result, token });
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { router as router };
