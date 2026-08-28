import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

export const validate =
  (schema: Schema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      const data = parsed as { body?: unknown; query?: unknown; params?: unknown };
      if (data.body !== undefined) req.body = data.body;
      if (data.query !== undefined) Object.assign(req.query, data.query);
      if (data.params !== undefined) Object.assign(req.params, data.params);
      next();
    } catch (err) {
      next(err);
    }
  };
