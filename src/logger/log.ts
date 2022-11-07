import { createLogger, format, transport } from 'winston';
import expressWinston from 'express-winston';
import { devConsole, file } from './transports';
import { NextFunction } from 'express';
import { getAppEnvVar } from '../utils/env';

// Configure logging based on runtime environment.
// Console logs are enabled only with dev configs.
// Production log level is set to 'info'.
let logLevel = getAppEnvVar('APP_ENV') === 'DEVELOPEMENT' ? 'debug' : 'info';
const sinks: transport[] = [file];

if (getAppEnvVar('APP_ENV') === 'DEVELOPEMENT') {
  sinks.push(devConsole);
}

export const httpBegin = expressWinston.logger({
  transports: sinks,
  msg:
    '[HTTP {{req.httpVersion}}] - [{{req.method}}] - [{{req.ip}}]' +
    ' - {{req.hostname}}{{req.url}}',
});

export const httpEnd = (_: any, res: any, next: NextFunction) => {
  res.on('finish', () => log.info(`${res.statusCode}`));
  next();
};

export const httpError = expressWinston.errorLogger({
  level: logLevel,
  format: format.combine(format.colorize(), format.json()),
  transports: sinks,
});

export const log = createLogger({
  level: logLevel,
  transports: sinks,
});

if (getAppEnvVar('APP_ENV') === 'CI') {
  log.silent = true;
  logLevel = 'silly';
}
