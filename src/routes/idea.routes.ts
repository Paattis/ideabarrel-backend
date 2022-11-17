import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Idea } from '@prisma/client';
import { log } from '../logger/log';
import { db } from '../db/context';
import ideasClient, { IdeaData } from '../db/ideas';
import { TRequest as TRequest } from '../utils/types';
import { respondWithError } from '../utils/errors';

const ideas = Router();

ideas.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNum = parseInt((req.query.page_num || '0') as string);
    log.info(`groups: ${JSON.stringify(req.query.groups)}`);

    const groups = req.query.groups as string[];
    const groupIds = groups ? groups.map(Number) : [];

    const results = await ideasClient.all(db, pageNum, groupIds);
    res.json(results);
  } catch (err) {
    return respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id);
    const result: Idea = await ideasClient.select(id, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.post('/', async (req: TRequest<IdeaData>, res: Response, next: NextFunction) => {
  try {
    const result = await ideasClient.create(req.body, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.put('/:id', async (req: TRequest<IdeaData>, res: Response, next: NextFunction) => {
  try {
    const ideaId = Number.parseInt(req.params.id);
    const result = await ideasClient.update(req.body, ideaId, db);
    res.json(result);
  } catch (err) {
    //throw err
    respondWithError(res, err);
  } finally {
    next();
  }
});

ideas.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ideaId = Number.parseInt(req.params.id);
    const result = await ideasClient.remove(ideaId, db);
    res.json(result);
  } catch (err) {
    respondWithError(res, err);
  } finally {
    next();
  }
});

export { ideas as router };
