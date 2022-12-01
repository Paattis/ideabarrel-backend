import { Router, Response, NextFunction, Request } from 'express';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { throwIfNotValid, validRoleBody } from '../validation/schema';
import { db, Roles } from '../db/Database';

const roles = Router();

type QueryParam = 'usr';
const queryisPresent = (req: Request, param: QueryParam): boolean =>
  Boolean(req.query[param]);

roles.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (queryisPresent(req, 'usr')) {
      const result = await db().roles.allRolesWithUsers();
      res.json(result);
    } else {
      const result = await db().roles.all();
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
        const result = await db().roles.selectWithUsers(roleId);
        res.json(result);
      } else {
        const result = await db().roles.select(roleId);
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
  validRoleBody,
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<Roles.Create>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const result = await db().roles.create(req.body);
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
  validRoleBody,
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<Roles.Update>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const roleId = Number.parseInt(req.params.id, 10);
      const result = await db().roles.update(roleId, req.body);
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
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = Number.parseInt(req.params.id, 10);
      const result = await db().roles.remove(roleId);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { roles as router };
