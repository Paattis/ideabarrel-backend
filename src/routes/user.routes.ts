import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { PublicUser, UserData } from '../db/users';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { NoSuchResource, ServerError } from '../utils/errors';
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

users.get(
  '/:id',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const result = await usersClient.select(id, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

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

users.put(
  '/:id/img',
  auth.sameUser,
  img.upload.single('avatar'),
  img.resize,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      if (req.file) {
        log.debug(`File in request: ${req.file.filename}`);
        const fields = req.user as UserData;
        const old = fields.profile_img;
        fields.profile_img = req.file.filename;
        const result = await usersClient.update({ ...fields }, userId, db);
        log.debug('Updated avatar for user ' + userId);
        // Remove old file
        if (old !== req?.file?.filename) {
          await img.remove(old);
        }
        return res.json(result);
      } else throw ServerError;
    } catch (err) {
      return next(err);
    } finally {
      next();
    }
  }
);

users.delete(
  '/:id/img',
  auth.sameUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const user = req.user as PublicUser;
      const oldImg = user.profile_img;
      if (!oldImg) {
        throw new NoSuchResource('avatar');
      }

      const result = await usersClient.update(
        { ...(user as unknown as UserData), profile_img: '' },
        id,
        db
      );
      await img.remove(oldImg);
      return res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.post(
  '/',
  img.upload.single('avatar'),
  img.resize,
  async (req: TRequest<UserData>, res: Response, next: NextFunction) => {
    try {
      const fields: UserData = {
        name: req.body.name,
        password: await auth.hash(req.body.password),
        profile_img: req.file?.filename ?? '',
        role_id: Number.parseInt(req.body.role_id as unknown as string),
      };
      const result = await usersClient.create(fields, db);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

export { users as router };
