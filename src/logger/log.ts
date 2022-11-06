import { createLogger, format } from 'winston';
import expressWinston from 'express-winston';
import { devConsole, file } from './transports';
import { NextFunction } from 'express';

// const LOG_LEVEL = 'info'
const LOG_LEVEL = 'debug';

export const httpBegin = expressWinston.logger({
  transports: [devConsole, file],
  msg:
    '[HTTP {{req.httpVersion}}] - [{{req.method}}] - [{{req.ip}}]' +
    '- {{req.hostname}}{{req.url}}',
});

export const httpEnd = (_: any, res: any, next: NextFunction) => {
  res.on('finish', () => log.info(`${res.statusCode}`));
  next();
};

export const httpError = expressWinston.errorLogger({
  transports: [devConsole, file],
  format: format.combine(format.colorize(), format.json()),
});

export const log = createLogger({
  level: LOG_LEVEL,
  transports: [devConsole, file],
});
