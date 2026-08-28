import pino from 'pino';
import { config } from '@/config';

export const logger = pino({
  level: config.log.level,
  base: { service: 'ams-backend', env: config.env },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    // Log the level as a string ("info") instead of pino's default number (30).
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-society-token"]',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    remove: true,
  },
  ...(config.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }),
});
