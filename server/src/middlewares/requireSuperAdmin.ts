import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/utils/ApiError';

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.context) {
    next(
      ApiError.internal('Request context missing — place authenticate before requireSuperAdmin'),
    );
    return;
  }
  if (!req.context.isSuperAdmin) {
    next(ApiError.forbidden());
    return;
  }
  next();
}
