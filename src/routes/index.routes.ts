import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  res.send({ msg: 'Hello world!' });
});

export { router };
