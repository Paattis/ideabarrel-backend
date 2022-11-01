import express, {Application ,Request, Response, NextFunction} from 'express';
import {router as indexRoutes} from './routes/index.routes';

const app:Application = express();

app.use('/', indexRoutes);
export default app
