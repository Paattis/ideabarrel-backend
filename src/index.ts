import app from './app';
import { log } from './logger/log';
import { getAppEnvVar } from './utils/env';

export const port = process.env.PORT || 3000;

log.info(`PORT: ${port}`);
log.info(`MODE: ${getAppEnvVar('APP_ENV')}`);
log.info(`ADMIN: ${getAppEnvVar('ADMIN_EMAIL')}`);
log.info('');

app.listen(port, (): void => {
  log.info('Application started');
});
