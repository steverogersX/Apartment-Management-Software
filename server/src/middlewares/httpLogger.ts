import { randomUUID } from 'node:crypto';
import { pinoHttp, type Options } from 'pino-http';
import { logger } from '@/utils/logger';

const options: Options = {
  logger,

  // Reuse an inbound X-Request-Id for tracing across services, else generate one,
  // and echo it back so clients/load balancers can correlate the request.
  genReqId: (req, res) => {
    const header = req.headers['x-request-id'];
    const id = (Array.isArray(header) ? header[0] : header) || randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },

  // 5xx -> error, 4xx -> warn, everything else -> info.
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },

  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} ${res.statusCode} ${err.message}`,

  // Log only what's useful — not the full header/query dump pino-http emits by default.
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },

  // Skip noise that isn't worth a log line.
  autoLogging: {
    ignore: (req) => req.url === '/favicon.ico',
  },
};

export const httpLogger = pinoHttp(options);
