import express, { Application } from 'express';
import { router as userRoutes } from './routes/user.routes';
import { router as roleRoutes } from './routes/roles.routes';
import { router as likeRoutes } from './routes/like.routes';
import { router as commentRoutes } from './routes/comment.routes';
import { router as tagRoutes } from './routes/tags.routes';
import { router as authRoutes } from './routes/auth.routes';
import { router as ideaRoutes } from './routes/idea.routes';
import { httpBegin as httpLogger, httpEnd as httpEndLogger } from './logger/log';
import auth from './utils/auth';
import { httpHandler as httpErrorHandler } from './utils/errors';
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from './swagger.json'
import swaggerAutogen from 'swagger-autogen';


const app: Application = express();

// Pre router middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Loggers for http requests.
app.use(httpLogger);

app.use(auth.passport.initialize());

// ----------- Routes -------------
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/tags', tagRoutes);
app.use('/auth', authRoutes);
app.use('/ideas', auth.required, ideaRoutes);
app.use('/likes', auth.required, likeRoutes);
app.use('/comments', auth.required, commentRoutes);
app.use('/static/', express.static('uploads'));
// --------------------------------

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(httpErrorHandler);
app.use(httpEndLogger);

export default app;
