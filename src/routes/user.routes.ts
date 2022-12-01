import { User } from '@prisma/client';
import { Router, Response, NextFunction, Request } from 'express';
import { db, Users } from '../db/Database';
import { PublicUser } from '../db/UserClient';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { NoSuchResource, ServerError } from '../utils/errors';
import img from '../utils/img';
import { TRequest as TRequest } from '../utils/types';
import {
  throwIfNotValid,
  validAvatar,
  validEmailCheck,
  validUserBody,
} from '../validation/schema';

const users = Router();

const toUser = async (user: User, id: number) => db().users.userOwns(user, id);

users.get('/', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await db().users.all();

    res.send(results);
  } catch (err) {
    next(err);
  } finally {
    next();
  }
});

/* for whatever reason Swagger-Autogen actively refuses to read
  comments inside route controllers call a method that uses the `Prisma.findMany()` method.
  It will read this stub just fine though and this is infinitely easier 
  than trying to debug a JS library */
users.get('/', async (_: Request, __: Response, ___: NextFunction) => {
  /* #swagger.responses[200] = {
            description: "",
            schema: [{$ref: '#/definitions/user'}]
    } */
});

users.get(
  '/:id',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      const id = Number.parseInt(req.params.id, 10);
      const result = await db().users.select(id);
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
  validUserBody,
  auth.required,
  auth.userHasAccess(toUser),
  async (req: TRequest<Users.Update>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      throwIfNotValid(req);
      const userId = parseInt(req.params.id, 10);
      const result = await db().users.update(req.body, userId);
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
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      const userId = parseInt(req.params.id, 10);
      const result = await db().users.remove(userId);
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
  validAvatar,
  auth.required,
  auth.userHasAccess(toUser),
  img.upload.single('avatar'),
  img.resize,
  async (req: Request, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      throwIfNotValid(req);
      if (req.file) {
        const result = await db().users.updateAvatar(
          parseInt(req.params.id, 10),
          req.file.filename
        );
        log.debug('Updated avatar for user ' + req.params.id);
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
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      const user = req.user as PublicUser;
      if (!user.profile_img) {
        throw new NoSuchResource('avatar');
      }
      const EMPTY_AVATAR = '';
      const result = await db().users.updateAvatar(
        parseInt(req.params.id, 10),
        EMPTY_AVATAR
      );
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
  validUserBody,
  async (req: TRequest<Users.Create>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/user'}
    } */
    try {
      throwIfNotValid(req);
      const fields: Users.Create = {
        email: req.body.email,
        name: req.body.name,
        password: await auth.hash(req.body.password),
        profile_img: req.file?.filename ?? '',
        role_id: parseInt(req.body.role_id as any as string | '0', 10),
      };
      const result = await db().users.create(fields);
      res.json(result);
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
);

users.post(
  '/email/free',
  validEmailCheck,
  async (req: TRequest<{ email: string }>, res: Response, next: NextFunction) => {
    /* #swagger.responses[200] = {
            description: "",
            schema: {$ref: '#/definitions/emailFree'}
    } */
    try {
      throwIfNotValid(req);
      const exist = await db().users.emailExists(req.body.email);
      return res.json({ free: !exist });
    } catch (error) {
      next(error);
    } finally {
      next();
    }
  }
);

export { users as router };
