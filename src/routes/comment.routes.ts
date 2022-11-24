import { db } from '../db/context';
import { Router, Response, NextFunction, Request } from 'express';
import commentsClient, { CommentFields } from '../db/comments';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { PublicUser } from '../db/users';
import { User } from '@prisma/client';
import { throwIfNotValid, validCommentBody } from '../validation/schema';

const comments = Router();

const toComment = async (user: User, id: number) =>
  commentsClient.userOwned(user, id, db);

comments.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await commentsClient.all(db);
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
    const result = await commentsClient.select(commentId, db);
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
  async (req: TRequest<CommentFields>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const user = req.user as PublicUser;
      const result = await commentsClient.create(
        {
          ...req.body,
          user_id: user.id,
        },
        db
      );
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
      const result = await commentsClient.remove(commentId, db);
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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = Number.parseInt(req.params.id, 10);
      const result = await commentsClient.update(commentId, req.body, db);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { comments as router };
