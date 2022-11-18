import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { PublicUser, UserData } from '../db/users';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { ServerError } from '../utils/errors';
import img from '../utils/img';
import { TRequest as TRequest } from '../utils/types';

const users = Router();

users.get('/', auth.required, async (_: Request, res: Response, next: NextFunction) => {
  try {
    const results = await usersClient.all(db);
    res.json(results);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

users.get('/:id', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const result = await usersClient.select(id, db);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

users.put(
  '/:id',
  auth.sameUser,
  async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const result = await usersClient.update(req.body, userId, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.delete(
  '/:id',
  auth.sameUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const result = await usersClient.remove(userId, db);
      img.remove(result.profile_img);
      result.profile_img = '';
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.post('/', async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
  try {
    const result = await usersClient.create(req.body, db);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

users.post(
  '/:id/img',
  img.upload.single('avatar'),
  auth.sameUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      if (req.file) {
        log.debug(JSON.stringify(req.file));
        const userFields = req.user as UserData;
        const result = await usersClient.update(
          { ...userFields, profile_img: req.file.filename },
          userId,
          db
        );
        log.debug('Attached file to user ' + userId);
        return res.json(result)
      } else throw ServerError;
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.delete('/:id/img', auth.sameUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const user = req.user as PublicUser;
    const oldImg = user.profile_img;
    const result = await usersClient.update(
      { ...(user as unknown as UserData), profile_img: '' },
      id,
      db
    );
    await img.remove(oldImg);
    return res.json(result)
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

export { users as router };
