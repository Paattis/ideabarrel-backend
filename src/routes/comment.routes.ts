import auth from '../utils/auth';
import { Router, Response, NextFunction, Request } from 'express';
import { Comments, getDb } from '../db/Database';
import { TRequest as TRequest } from '../utils/types';
import { User } from '@prisma/client';
import { throwIfNotValid, validCommentBody } from '../validation/schema';
import { PublicUser } from '../db/UserClient';

const comments = Router();

const toComment = async (user: User, id: number) =>
  getDb().access.comments.userOwns(user, id);

comments.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getDb().access.comments.all();
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

comments.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = Number.parseInt(req.params.id, 10);
    const result = await getDb().access.comments.select(commentId);
    return res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

comments.post(
  '/',
  validCommentBody,
  async (req: TRequest<Comments.Create>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const user = req.user as PublicUser;
      const result = await getDb().access.comments.create({
        ...req.body,
        user_id: user.id,
      });
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

comments.delete(
  '/:id',
  auth.userHasAccess(toComment),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = Number.parseInt(req.params.id, 10);
      const result = await getDb().access.comments.remove(commentId);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

comments.put(
  '/:id',
  auth.userHasAccess(toComment),
  async (req: TRequest<Comments.Update>, res: Response, next: NextFunction) => {
    try {
      const commentId = Number.parseInt(req.params.id, 10);
      const result = await getDb().access.comments.update(commentId, req.body);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { comments as router };
