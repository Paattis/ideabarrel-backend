import { Response } from 'express';
import { log } from '../logger/log';

export type MissingResource = 'role' | 'user' | 'idea' | 'comment';

const noSuch = (str: MissingResource) => `No such ${str} exists`;

export interface IApiError {
  details: string | null;
  code: number;
  json(): { status: number; msg: string };
}

export const ServerError = {
  status: 500,
  msg: 'Internal server error',
};

function isApiError(err: unknown): err is IApiError {
  return (err as IApiError).json !== undefined;
}

export const respondWithError = (res: Response, err: unknown) => {
  if (isApiError(err)) {
    res.status(err.code).json(err.json());
  } else {
    res.status(500).json(ServerError);
  }
};

export class BadRequest extends Error implements IApiError {
  public readonly code = 400;
  public readonly details: string | null;

  constructor(msg: string, devDetails: string | null = null) {
    log.error(msg);
    if (devDetails) {
      log.error(devDetails);
    }
    super(msg);
    this.details = devDetails;
  }

  public json() {
    return {
      status: this.code,
      msg: this.message,
    };
  }
}

export class NoSuchResource extends Error implements IApiError {
  public readonly code = 404;
  public readonly details: string | null;

  constructor(type: MissingResource, devDetails: string | null = null) {
    const msg = noSuch(type);
    log.error(msg);
    if (devDetails) {
      log.error(devDetails);
    }
    super(msg);
    this.details = devDetails;
  }

  public json() {
    return {
      status: this.code,
      msg: this.message,
    };
  }
}
