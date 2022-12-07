import { Request } from 'express';

export interface TRequest<T> extends Request {
  body: T;
}