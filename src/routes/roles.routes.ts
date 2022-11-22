import { Role } from '@prisma/client';
import { db } from '../db/context';
import { Router, Response, NextFunction, Request } from 'express';
import rolesClient, { RoleFields } from '../db/roles';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';

const roles = Router();

type QueryParam = 'usr';
const queryisPresent = (req: Request, param: QueryParam): boolean =>
  Boolean(req.query[param]);

roles.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (queryisPresent(req, 'usr')) {
      const result = await rolesClient.allRolesWithUsers(db);
      res.json(result);
    } else {
      const result = await rolesClient.all(db);
      res.json(result);
    }
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

roles.get(
  '/:id',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = Number.parseInt(req.params.id, 10);
      if (queryisPresent(req, 'usr')) {
        const result = await rolesClient.selectWithUsers(roleId, db);
        res.json(result);
      } else {
        const result: Role = await rolesClient.select(roleId, db);
        res.json(result);
      }
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

roles.post(
  '/',
  auth.admin,
  async (req: TRequest<RoleFields>, res: Response, next: NextFunction) => {
    try {
      const result = await rolesClient.create(req.body, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

roles.put(
  '/:id',
  auth.admin,
  async (req: TRequest<RoleFields>, res: Response, next: NextFunction) => {
    try {
      const roleId = Number.parseInt(req.params.id, 10);
      const result = await rolesClient.update(roleId, req.body, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

roles.delete(
  '/:id',
  auth.admin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = Number.parseInt(req.params.id, 10);
      const result = await rolesClient.remove(roleId, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { roles as router };
