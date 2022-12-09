import { Request } from 'express';

export interface TRequest<T> extends Request {
  body: T;
}

export const ADMIN_ROLE_NAME = "admin"