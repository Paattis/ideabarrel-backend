import { Role } from '@prisma/client';
import { db } from '../db/context';
import { Router, Response, NextFunction, Request } from 'express';
import rolesClient, { NewRole } from '../db/roles';
import { TRequest as TRequest } from '../utils/types';

const roles = Router();

roles.get('/', async (_, res: Response, next: NextFunction) => {
  try {
    const result = await rolesClient.all(db);
    res.json(result);
  } catch (e) {
    res.status(404).json([]);
  }
  next();
});

roles.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: Role = await rolesClient.select(id, db);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ status: 404, msg: e.message });
  }
  next();
});

roles.post('/', async (req: TRequest<NewRole>, res: Response, next: NextFunction) => {
  try {
    const result: Role = await rolesClient.create(req.body, db);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ status: 400, msg: e.message });
  }
  next();
});

export { roles as router };
