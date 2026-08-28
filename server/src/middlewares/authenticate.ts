import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/utils/ApiError';
import { authService } from '@/module/auth/auth.service';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized('Authentication required');

    const rawToken = header.slice(7);
    const { userId, isSuperAdmin } = await authService.resolveSession(rawToken);

    const societyToken = req.headers['x-society-token'];
    const societyId =
      typeof societyToken === 'string' && societyToken
        ? await authService.resolveSociety(societyToken)
        : null;

    const permissions =
      societyId && !isSuperAdmin
        ? await authService.getEffectivePermissions(userId, societyId)
        : new Set<string>();

    req.context = { userId, isSuperAdmin, societyId, permissions };
    next();
  } catch (err) {
    next(err);
  }
}
