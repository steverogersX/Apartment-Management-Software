import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { authService } from './auth.service';

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized();
  return header.slice(7);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body as {
    email: string;
    password: string;
    displayName: string;
  };
  const user = await authService.register(email, password, displayName);
  sendSuccess(res, user, { statusCode: StatusCodes.CREATED, message: 'Account created' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  sendSuccess(res, result, { message: 'Login successful' });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = extractBearerToken(req);
  await authService.logout(rawToken);
  sendSuccess(res, null, { message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.context) throw ApiError.internal('Request context missing');
  const user = await authService.getMe(req.context);
  sendSuccess(res, user);
});
