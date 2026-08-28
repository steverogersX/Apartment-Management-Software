import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config';
import { httpLogger } from '@/middlewares/httpLogger';
import { apiRoutes } from '@/routes';
import { errorHandler } from '@/middlewares/errorHandler';
import { notFound } from '@/middlewares/notFound';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin:
        config.cors.origin === '*' ? true : config.cors.origin.split(',').map((o) => o.trim()),
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(httpLogger);

  app.use('/api/v1', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
