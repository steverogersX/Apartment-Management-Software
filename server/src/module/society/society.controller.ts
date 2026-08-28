import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { societyService } from './society.service';

export const createSociety = asyncHandler(async (req: Request, res: Response) => {
  const { name, adminUserId } = req.body as { name: string; adminUserId: string };
  const society = await societyService.createSociety(name, adminUserId);
  sendSuccess(res, society, { statusCode: StatusCodes.CREATED, message: 'Society created' });
});

export const getSocieties = asyncHandler(async (_req: Request, res: Response) => {
  const result = await societyService.getSocieties();
  sendSuccess(res, result);
});

export const getSociety = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params as { societyId: string };
  const society = await societyService.getSociety(societyId);
  sendSuccess(res, society);
});

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params as { societyId: string };
  const members = await societyService.getMembers(societyId);
  sendSuccess(res, members);
});

export const assignMember = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params as { societyId: string };
  const { userId, roleId } = req.body as { userId: string; roleId: string };
  await societyService.assignMember(societyId, userId, roleId);
  sendSuccess(res, null, { statusCode: StatusCodes.CREATED, message: 'Member assigned' });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const { societyId, userId } = req.params as { societyId: string; userId: string };
  await societyService.removeMember(societyId, userId);
  sendSuccess(res, null, { message: 'Member removed' });
});
