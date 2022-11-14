import { User } from '@prisma/client';
import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { UserData } from '../db/users';
import { respondWithError } from '../utils/errors';
import { TRequest as TRequest } from '../utils/types';

const users = Router();

users.get('/', async (_, res: Response, next: NextFunction) => {
  try {
    const results = await usersClient.all(db);
    res.json(results);
  } catch (err) {
    return respondWithError(res, err);
  } finally {
    next();
  }
});

users.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: User = await usersClient.select(id, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

users.put('/:id', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const userId = Number.parseInt(req.params.id);
    const result = await usersClient.update(req.body, userId, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

users.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number.parseInt(req.params.id);
    const result = await usersClient.remove(userId, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

users.post('/', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const result = await usersClient.create(req.body, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

export { users as router };