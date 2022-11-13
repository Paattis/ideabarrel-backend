import { createLogger, format, transport, transports } from 'winston';
import expressWinston from 'express-winston';
// import { devConsole, file } from './transports';
import { NextFunction, Request, Response } from 'express';
import { getAppEnvVar } from '../utils/env';

// Configure logging based on runtime environment.
// Console logs are enabled only with dev configs.
// Production log level is set to 'info'.
let logLevel = getAppEnvVar('APP_ENV') === 'DEVELOPEMENT' ? 'debug' : 'info';

const ftime = 'YYYY-MM-DD HH:mm:ss:ms';
const baseFormat = format.combine(
  format.timestamp({ format: ftime }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
);

export const devConsole = new transports.Console({
  format: format.combine(format.colorize(), baseFormat),
  level: logLevel,
});

export const file = new transports.File({
  format: baseFormat,
  dirname: 'logs',
  level: logLevel,
  filename: 'server.log',
});

const sinks: transport[] = [file];

if (getAppEnvVar('APP_ENV') === 'DEVELOPEMENT') {
  sinks.push(devConsole);
}

export const httpBegin = (req: Request, res: any, next: NextFunction) => {
  log.info(
    `HTTP ${req.httpVersion} - [${req.method}] - [${req.ip}]` +
      ` - ${req.hostname}${req.url}`
  );
  if (req.body) {
    log.debug('Request body: ' + JSON.stringify(req.body));
  }
  next();
};

export const httpEnd = (req: Request, res: Response, next: NextFunction) => {
  log.info(`Request handled - ${res.statusCode}`);
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
  logLevel = 'error';
}
