import express, {Application ,Request, Response, NextFunction} from 'express';

const app:Application = express();

app.get('/', (req: Request, res: Response): void => {
  res.send('Hello world!')
});

export default app
