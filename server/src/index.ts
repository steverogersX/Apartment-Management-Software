import type { Server } from 'node:http';
import { createApp } from './app';
import { config } from '@/config';
import { logger } from '@/utils/logger';

function bootstrap(): void {
  const app = createApp();

  const server: Server = app.listen(config.server.port, () => {
    logger.info(`Server listening on http://localhost:${config.server.port} (${config.env})`);
  });

  const shutdown = (signal: string) => {
    logger.warn(`${signal} received, shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

bootstrap();
