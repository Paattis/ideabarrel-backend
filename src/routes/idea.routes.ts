import { Router, Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { TRequest as TRequest } from '../utils/types';
import { respondWithError } from '../utils/errors';
import auth from '../utils/auth';
import { throwIfNotValid, validIdeaBody, validIdeaQuery } from '../validation/schema';
import { db, Ideas } from '../db/Database';

const ideas = Router();

const toIdea = async (user: User, id: number) => db().ideas.userOwns(user, id);

ideas.get(
  '/',
  validIdeaQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      throwIfNotValid(req);

      let method = 'desc';
      let sort = req.query.desc ?? '';

      if (!sort) {
        sort = req.query.asc ?? '';
        method = 'asc';
      }

      const results = await db().ideas.all(
        req.query.page_num as unknown as number ?? 0,
        req.query.tags as unknown as number[] ?? [],
        sort as string,
        method as string
      );
      res.json(results);
    } catch (err) {
      return respondWithError(res, err);
    } finally {
      next();
    }
  }
);

/* for whatever reason Swagger-Autogen actively refuses to read
  comments inside route controllers call a method that uses the `Prisma.findMany()` method.
  It will read this stub just fine though and this is infinitely easier
  than trying to debug a compatibility issue between two libraries */
ideas.get('/', async (_: Request, __: Response, ___: NextFunction) => {
  /* #swagger.responses[200] = {
            description: "",
            schema: [{$ref: '#/definitions/idea'}]
    } */
});

ideas.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/idea'}
  } */

  try {
    const id = Number.parseInt(req.params.id, 10);
    const result = await db().ideas.select(id);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.post(
  '/',
  validIdeaBody,
  async (req: TRequest<Ideas.Create>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/idea'}
    } */

    try {
      throwIfNotValid(req);
      const result = await db().ideas.create(req.body, req.user as User);
      res.json(result);
    } catch (err) {
      respondWithError(res, err);
    } finally {
      next();
    }
  }
);

ideas.put(
  '/:id',
  validIdeaBody,
  auth.userHasAccess(toIdea),
  async (req: TRequest<Ideas.Update>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/idea'}
    } */
    try {
      throwIfNotValid(req);
      const ideaId = Number.parseInt(req.params.id, 10);
      const result = await db().ideas.update(req.body, ideaId);
      res.json(result);
    } catch (err) {
      respondWithError(res, err);
    } finally {
      next();
    }
  }
);

ideas.delete(
  '/:id',
  auth.userHasAccess(toIdea),
  async (req: Request, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
          description: "",
          schema: {$ref: '#/definitions/idea'}
    } */
    try {
      const ideaId = Number.parseInt(req.params.id, 10);
      const result = await db().ideas.remove(ideaId, req.user as User);
      res.json(result);
    } catch (err) {
      respondWithError(res, err);
    } finally {
      next();
    }
  }
);

export { ideas as router };
