import express, { Application } from 'express';
import { router as indexRoutes } from './routes/index.routes';
import {
  httpBegin as httpLogger,
  httpEnd as httpEndLogger,
  httpError as httpErrorLogger,
} from './logger/log';

const app: Application = express();

// Loggers for http requests.
app.use(httpLogger);
app.use(httpEndLogger);

// Now set the routrs
app.use('/', indexRoutes);

// Finally error logger
app.use(httpErrorLogger);

export default app;
