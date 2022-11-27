import { Router, Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import { log } from '../logger/log';
import { TRequest as TRequest } from '../utils/types';
import { respondWithError } from '../utils/errors';
import auth from '../utils/auth';
import { throwIfNotValid, validIdeaBody } from '../validation/schema';
import { getDb, Ideas } from '../db/Database';

const ideas = Router();

const toIdea = async (user: User, id: number) => getDb().access.ideas.userOwns(user, id);

ideas.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNum = parseInt((req.query.page_num || '0') as string, 10);
    log.info(`tags: ${JSON.stringify(req.query.tags)}`);

    const tags = req.query.tags as string[];
    const tagIds = tags ? tags.map(Number) : [];

    const results = await getDb().access.ideas.all(pageNum, tagIds);
    res.json(results);
  } catch (err) {
    return respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const result = await getDb().access.ideas.select(id, req.user as User);
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
    try {
      throwIfNotValid(req);
      const result = await getDb().access.ideas.create(req.body, req.user as User);
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
    try {
      throwIfNotValid(req);
      const ideaId = Number.parseInt(req.params.id, 10);
      const result = await getDb().access.ideas.update(req.body, ideaId);
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
    try {
      const ideaId = Number.parseInt(req.params.id, 10);
      const result = await getDb().access.ideas.remove(ideaId, req.user as User);
      res.json(result);
    } catch (err) {
      respondWithError(res, err);
    } finally {
      next();
    }
  }
);

export { ideas as router };
