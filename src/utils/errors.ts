import { Response } from 'express';
import { log } from '../logger/log';

export const ServerError = {
  status: 500,
  msg: 'Internal server error',
};

function isApiError(err: unknown): err is ApiError {
  return (err as ApiError).json !== undefined;
}

export const respondWithError = (res: Response, err: unknown) => {
  if (isApiError(err)) {
    res.status(err.code).json(err.json());
  } else {
    res.status(ServerError.status).json(ServerError);
  }
};

abstract class ApiError extends Error {
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
    log.error(msg);
    if (dev) log.error(JSON.stringify(dev));
    this.dev = dev;
  }
}

export class Forbidden extends ApiError {
  public readonly code = 403;
  constructor(dev: any = null) {
    super('Forbidden resource', dev);
  }
}

export class BadRequest extends ApiError {
  public readonly code = 400;
  constructor(msg: string, dev: any = null) {
    super(msg, dev);
  }
}

export type MissingResource = 'role' | 'user' | 'idea' | 'comment';

export class NoSuchResource extends ApiError {
  public readonly code = 404;
  constructor(type: MissingResource, dev: any = null) {
    super(`No such ${type} exists`, dev);
  }
}
