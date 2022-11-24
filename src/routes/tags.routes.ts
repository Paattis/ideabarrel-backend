import { Tag } from '@prisma/client';
import { db } from '../db/context';
import { Router, Response, NextFunction, Request } from 'express';
import tagsClient, { TagFields } from '../db/tags';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';

const tags = Router();

type QueryParam = 'usr';
const queryisPresent = (req: Request, param: QueryParam): boolean =>
  Boolean(req.query[param]);

tags.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tagsClient.all(db);
    res.json(result);
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
        const result = await tagsClient.selectWithUsers(id, db);
        res.json(result);
      } else {
        const result: Tag = await tagsClient.select(id, db);
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
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<TagFields>, res: Response, next: NextFunction) => {
    try {
      const result = await tagsClient.create(req.body, db);
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
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<TagFields>, res: Response, next: NextFunction) => {
    try {
      const result = await tagsClient.addUserToTag(
        parseInt(req.params.tagId, 10),
        parseInt(req.params.userId, 10),
        db
      );
      res.json(result);
    } catch (err) {
      throw err;
      next(err);
    } finally {
      next();
    }
  }
);

tags.delete(
  '/:tagId/user/:userId',
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<TagFields>, res: Response, next: NextFunction) => {
    try {
      const result = await tagsClient.removeUserFromTag(
        parseInt(req.params.tagId, 10),
        parseInt(req.params.userId, 10),
        db
      );
      res.json(result);
    } catch (err) {
      throw err;
      next(err);
    } finally {
      next();
    }
  }
);

tags.put(
  '/:id',
  auth.required,
  auth.userHasAccess(auth.onlyAdmin),
  async (req: TRequest<TagFields>, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const result = await tagsClient.update(id, req.body, db);
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
      const result = await tagsClient.remove(id, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { tags as router };
