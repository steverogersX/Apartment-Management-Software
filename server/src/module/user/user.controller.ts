import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import type { CreateUserBody, EditUserBody } from '@shared/index';
import { userService } from './user.service';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.context) throw ApiError.internal('Request context missing');
  const { societyId } = req.params as { societyId: string };
  const data = req.body as CreateUserBody;
  const user = await userService.createUser(societyId, req.context.permissions, data);
  sendSuccess(res, user, { statusCode: StatusCodes.CREATED, message: 'User created' });
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.context) throw ApiError.internal('Request context missing');
  const { societyId, userId } = req.params as { societyId: string; userId: string };
  const data = req.body as EditUserBody;
  const user = await userService.editUser(societyId, userId, req.context.permissions, data);
  sendSuccess(res, user, { message: 'User updated' });
});
