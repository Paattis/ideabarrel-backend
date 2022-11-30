import { Router, Response, NextFunction, Request } from 'express';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { User } from '@prisma/client';
import { throwIfNotValid, validLikeBody } from '../validation/schema';
import { PublicUser } from '../db/UserClient';
import { db, Likes } from '../db/Database';

const likes = Router();
const toLike = async (user: User, id: number) => db().likes.userOwns(user, id);

likes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db().likes.all();
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

likes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const likeId = Number.parseInt(req.params.id, 10);
    const result = await db().likes.select(likeId);
    return res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

likes.post(
  '/',
  validLikeBody,
  async (req: TRequest<Likes.Create>, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);
      const user = req.user as PublicUser;
      const result = await db().likes.create({
        idea_id: req.body.idea_id,
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

likes.delete(
  '/:id',
  auth.userHasAccess(toLike),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const likeId = Number.parseInt(req.params.id, 10);
      const result = await db().likes.remove(likeId);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

likes.delete(
  '/idea/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ideaId = Number.parseInt(req.params.id, 10);
      const user = req.user as User;
      const result = await db().likes.removeFromIdea(ideaId, user.id);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

likes.post('/idea/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ideaId = Number.parseInt(req.params.id, 10);
    const user = req.user as User;
    const result = await db().likes.createForIdea(ideaId, user.id);
    return res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

export { likes as router };
