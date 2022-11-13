import { User } from '@prisma/client';
import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { UserData } from '../db/users';
import { TRequest as TRequest } from '../utils/types';

const users = Router();

users.get('/', async (_, res: Response, next: NextFunction) => {
  try {
    const results = await usersClient.all(db);
    res.json(results);
  } catch (e) {
    res.status(404).json([]);
  }
  next();
});

users.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: User = await usersClient.select(id, db);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ status: 404, msg: e.message });
  }
  next();
});

users.put('/:id', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: User = await usersClient.update(req.body, id, db);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ status: 404, msg: e.message });
  }
  next();
});

users.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: User = await usersClient.remove(id, db);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ status: 404, msg: "Can't delete user." });
  }
  next();
});

users.post('/', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const result: User = await usersClient.create(req.body, db);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ status: 400, msg: e.message });
  }
  next();
});

export { users as router };
