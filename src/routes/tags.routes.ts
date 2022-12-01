import { User } from '@prisma/client';
import { Router, Response, NextFunction, Request } from 'express';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { throwIfNotValid, validTagBody } from '../validation/schema';
import { db, Tags } from '../db/Database';

const tags = Router();

const toUser = async (user: User, id: number) => db().users.userOwns(user, id);

type QueryParam = 'usr';
const queryisPresent = (req: Request, param: QueryParam): boolean =>
  Boolean(req.query[param]);

tags.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (queryisPresent(req, 'usr')) {
      const result = await db().tags.allTagsWithUsers();
      res.json(result);
    } else {
      const result = await db().tags.all();
      res.json(result);
    }
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

tags.get(
  '/:id',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (queryisPresent(req, 'usr')) {
        const result = await db().tags.selectWithUsers(id);
        res.json(result);
      } else {
        const result = await db().tags.select(id);
        res.json(result);
      }
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

tags.post(
  '/',
  validTagBody,
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<Tags.Create>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const result = await db().tags.create(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

tags.post(
  '/:tagId/user/:userId',
  auth.required,
  auth.userHasAccess(toUser),
  async (req: TRequest<Tags.Create>, res: Response, next: NextFunction) => {
    try {
      const result = await db().tags.addUserToTag(
        parseInt(req.params.tagId, 10),
        parseInt(req.params.userId, 10)
      );
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

tags.delete(
  '/:tagId/user/:userId',
  auth.required,
  auth.userHasAccess(toUser),
  async (req: TRequest<Tags.Delete>, res: Response, next: NextFunction) => {
    try {
      const result = await db().tags.removeUserFromTag(
        parseInt(req.params.tagId, 10),
        parseInt(req.params.userId, 10)
      );
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

tags.put(
  '/:id',
  validTagBody,
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<Tags.Update>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const id = Number.parseInt(req.params.id, 10);
      const result = await db().tags.update(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

tags.delete(
  '/:id',
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const result = await db().tags.remove(id);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { tags as router };
