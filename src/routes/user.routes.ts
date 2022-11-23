import { User } from '@prisma/client';
import { Router, Response, NextFunction, Request } from 'express';
import { db } from '../db/context';
import usersClient, { PublicUser, UserData } from '../db/users';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { NoSuchResource, ServerError } from '../utils/errors';
import img from '../utils/img';
import { TRequest as TRequest } from '../utils/types';

const users = Router();

const toUser = async (user: User, id: number) => usersClient.userOwns(user, id, db);

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
  auth.required,
  auth.userHasAccess(toUser),
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
  auth.required,
  auth.userHasAccess(toUser),
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
  auth.required,
  auth.userHasAccess(toUser),
  img.upload.single('avatar'),
  img.resize,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      if (req.file) {
        const user = req.user as UserData;
        const result = await usersClient.updateAvatar(
          userId,
          user.profile_img,
          req.file.filename,
          db
        );
        log.debug('Updated avatar for user ' + userId);
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
  auth.required,
  auth.userHasAccess(toUser),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as PublicUser;
      if (!user.profile_img) {
        throw new NoSuchResource('avatar');
      }
      const result = await usersClient.updateAvatar(user.id, user.profile_img, '', db);
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
        email: req.body.email,
        name: req.body.name,
        password: await auth.hash(req.body.password),
        profile_img: req.file?.filename ?? '',
        role_id: Number.parseInt(req.body.role_id as unknown as string | '0', 10),
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
