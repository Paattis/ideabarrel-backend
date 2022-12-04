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

/* for whatever reason Swagger-Autogen actively refuses to read
  comments inside route controllers call a method that uses the `Prisma.findMany()` method.
  It will read this stub just fine though and this is infinitely easier
  than trying to debug a compatibility issue between two libraries */
likes.get('/', async (_: Request, __: Response, ___: NextFunction) => {
  /* #swagger.responses[200] = {
            description: "",
            schema: [{$ref: '#/definitions/likeFull'}]
    } */
});

likes.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/likeFull'}
  } */
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

likes.get('/idea/:id', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/idea'}
  } */
  try {
    const ideaId = Number.parseInt(req.params.id, 10);
    const result = await db().likes.forIdea(ideaId);
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
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/likeFull'}
    } */
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
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/likeFull'}
    } */
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

likes.delete('/idea/:id', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/likeFull'}
  } */
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
});

likes.post('/idea/:id', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/likeFull'}
  } */
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
