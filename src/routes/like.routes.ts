import { Router, Response, NextFunction, Request } from 'express';
import { TRequest as TRequest } from '../utils/types';
import auth from '../utils/auth';
import { User } from '@prisma/client';
import { throwIfNotValid, validLikeBody } from '../validation/schema';
import { PublicUser } from '../db/UserClient';
import { getDb, Likes } from '../db/Database';

const likes = Router();
const toLike = async (user: User, id: number) => getDb().access.likes.userOwns(user, id);

likes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getDb().access.likes.all();
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
    const result = await getDb().access.likes.select(likeId);
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
      const result = await getDb().access.likes.create({
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
      const result = await getDb().access.likes.remove(likeId);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { likes as router };
