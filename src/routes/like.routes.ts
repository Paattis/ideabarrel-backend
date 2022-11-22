import { db } from '../db/context';
import { Router, Response, NextFunction, Request } from 'express';
import likesClient, { LikeFields } from '../db/likes';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { PublicUser } from '../db/users';
import { User } from '@prisma/client';

const likes = Router();

likes.get('/', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await likesClient.all(db);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

likes.get(
  '/:id',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const likeId = Number.parseInt(req.params.id, 10);
      const result = await likesClient.select(likeId, db);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

likes.post(
  '/',
  auth.required,
  async (req: TRequest<LikeFields>, res: Response, next: NextFunction) => {
    try {
      const user = req.user as PublicUser;
      const result = await likesClient.create(
        { idea_id: req.body.idea_id, user_id: user.id },
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

likes.delete(
  '/:id',
  auth.required,
  auth.userOwnsResource(async (user: User, id:number) => likesClient.userOwnsLike(user.id, id, db)),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const likeId = Number.parseInt(req.params.id, 10);
      const result = await likesClient.remove(likeId, db);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { likes as router };
