import { Router, Response, NextFunction } from 'express';
import userClient from '../db/users';
import { db } from '../db/context';
import { TRequest as TRequest } from '../utils/types';
import { Forbidden, respondWithError } from '../utils/errors';
import secrets from '../utils/secrets';

const auth = Router();

type AuthBody = {
  username: string;
  password: string;
};

auth.post('/', async (req: TRequest<AuthBody>, res: Response, next: NextFunction) => {
  try {
    const user = await userClient.selectByUsername(req.body.username, db);
    if (await secrets.match(req.body.password, user.password)) {
      res.json({ token: 'jee' });
    } else {
      throw new Forbidden(req.body);
    }
  } catch (error) {
    respondWithError(res, error);
  } finally {
    next();
  }
});

export { auth as router };
