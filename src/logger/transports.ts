import { transports, format } from 'winston';

const ftime = 'YYYY-MM-DD HH:mm:ss:ms';

const base = format.combine(
  format.timestamp({ format: ftime }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
);

export const devConsole = new transports.Console({
  format: format.combine(format.colorize(), base),
  level: 'debug',
});

export const file = new transports.File({
  format: base,
  dirname: 'logs',
  filename: 'server.log',
});
