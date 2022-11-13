import express, { Application } from 'express';
import { router as indexRoutes } from './routes/index.routes';
import { router as userRoutes } from './routes/user.routes';
import { router as roleRoutes } from './routes/roles.routes';
import {
  httpBegin as httpLogger,
  httpEnd as httpEndLogger,
  httpError as httpErrorLogger,
} from './logger/log';

const app: Application = express();

// Pre router middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Loggers for http requests.
app.use(httpLogger);

// ----------- Routes -------------
app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
// --------------------------------

app.use(httpEndLogger);

// Finally error logger
app.use(httpErrorLogger);

export default app;
