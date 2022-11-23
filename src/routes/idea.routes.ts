import { Router, Request, Response, NextFunction } from 'express';
import { Idea, User } from '@prisma/client';
import { log } from '../logger/log';
import { db } from '../db/context';
import ideasClient, { IdeaData } from '../db/ideas';
import { TRequest as TRequest } from '../utils/types';
import { respondWithError } from '../utils/errors';
import auth from '../utils/auth';

const ideas = Router();

const toIdea = async (user: User, id: number) => ideasClient.userOwns(user, id, db);

ideas.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNum = parseInt((req.query.page_num || '0') as string, 10);
    log.info(`tags: ${JSON.stringify(req.query.tags)}`);

    const tags = req.query.tags as string[];
    const tagIds = tags ? tags.map(Number) : [];

    const results = await ideasClient.all(db, pageNum, req.user as User, tagIds);
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
    const result: Idea = await ideasClient.select(id, req.user as User, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.post('/', async (req: TRequest<IdeaData>, res: Response, next: NextFunction) => {
  try {
    const result = await ideasClient.create(req.body, req.user as User, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.put(
  '/:id',
  auth.userHasAccess(toIdea),
  async (req: TRequest<IdeaData>, res: Response, next: NextFunction) => {
    try {
      const ideaId = Number.parseInt(req.params.id, 10);
      const result = await ideasClient.update(req.body, ideaId, req.user as User, db);
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
      const result = await ideasClient.remove(ideaId, req.user as User, db);
      res.json(result);
    } catch (err) {
      respondWithError(res, err);
    } finally {
      next();
    }
  }
);

export { ideas as router };
