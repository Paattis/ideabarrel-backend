import { NextFunction, Request, Response } from 'express';
import { log } from '../logger/log';
import img from './img';

export const ServerError = {
  status: 500,
  msg: 'Internal server error',
};

function isApiError(err: unknown): err is ApiError {
  return (err as ApiError).json !== undefined;
}

function hasStackTrace(err: unknown): err is Error {
  return (err as Error).stack !== undefined;
}

export const respondWithError = (res: Response, err: unknown) => {
  if (isApiError(err)) {
    log.error(err.message);
    if (err.dev) {
      log.error(err.dev);
    }
    res.status(err.code).json(err.json());
  } else {
    log.error('Error of unknown type: Defaulting to ServerError.');
    if (hasStackTrace(err)) {
      log.debug('FIX YOUR CODE. HERE');
      log.error(err.stack);
    }
    res.status(ServerError.status).json(ServerError);
  }
};

export abstract class ApiError extends Error {
  public abstract readonly code: number;
  public readonly dev: any;

  public json() {
    return {
      status: this.code,
      msg: this.message,
    };
  }

  constructor(msg: string, dev: any) {
    super(msg);
    if (dev) log.error(JSON.stringify(dev));
    this.dev = dev;
  }
}

export class Forbidden extends ApiError {
  public readonly code = 403;
  constructor(dev: any = null) {
    super('Forbidden', dev);
  }
}

export class Unauthorized extends ApiError {
  public readonly code = 401;
  constructor(dev: any = null) {
    super('Unauthorized', dev);
  }
}

export class BadRequest extends ApiError {
  public readonly code = 400;
  constructor(msg: string, dev: any = null) {
    super(msg, dev);
  }
}

export type MissingResource =
  | 'role'
  | 'user'
  | 'idea'
  | 'comment'
  | 'avatar'
  | 'like'
  | 'comment';

export class NoSuchResource extends ApiError {
  public readonly code = 404;
  constructor(type: MissingResource, dev: any = null) {
    super(`No such ${type} exists`, dev);
  }
}

export const httpHandler = async (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.file) {
    await img.remove(req.file?.filename ?? '');
  }
  respondWithError(res, err);
  next(err);
};
