import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { UserData } from '../db/users';
import auth from '../utils/auth';
// import auth from '../utils/auth';
import { TRequest as TRequest } from '../utils/types';

const users = Router();

users.use(auth.required);

users.get('/', async (_, res: Response, next: NextFunction) => {
  try {
    const results = await usersClient.all(db);
    res.json(results);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

users.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const result = await usersClient.select(id, db);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

users.put(
  '/:id',
  auth.sameUser,
  async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const result = await usersClient.update(req.body, userId, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.delete(
  '/:id',
  auth.sameUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const result = await usersClient.remove(userId, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.post('/', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const result = await usersClient.create(req.body, db);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

export { users as router };
