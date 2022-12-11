import auth from '../utils/auth';
import { Router, Response, NextFunction, Request } from 'express';
import { Comments, db } from '../db/Database';
import { TRequest as TRequest } from '../utils/types';
import { throwIfNotValid, validCommentBody } from '../validation/schema';
import { PublicUser } from '../db/UserClient';

const comments = Router();

const toComment = async (user: PublicUser, id: number) =>
  db().comments.userOwns(user, id);

comments.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db().comments.all();
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
comments.get('/', async (_: Request, __: Response, ___: NextFunction) => {
  /* #swagger.responses[200] = {
            description: "",
            schema: [{$ref: '#/definitions/comment'}]
    } */
});

comments.get('/:resId', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
        description: "",
        schema: {$ref: '#/definitions/comment'}
  } */
  try {
    const commentId = Number.parseInt(req.params.resId, 10);
    const result = await db().comments.select(commentId);
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
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/comment'}
    } */
    try {
      throwIfNotValid(req);
      const user = req.user as PublicUser;
      const result = await db().comments.create({
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
  '/:resId',
  auth.userHasAccess(toComment),
  async (req: Request, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/comment'}
    } */
    try {
      const commentId = Number.parseInt(req.params.resId, 10);
      const result = await db().comments.remove(commentId);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

comments.put(
  '/:resId',
  auth.userHasAccess(toComment),
  async (req: TRequest<Comments.Update>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/comment'}
    } */
    try {
      const commentId = Number.parseInt(req.params.resId, 10);
      const result = await db().comments.update(commentId, req.body);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { comments as router };
