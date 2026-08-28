import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { roleService } from './role.service';

type RoleBody = { name: string; description?: string; permissions: string[] };

export const listRoles = asyncHandler(async (req: Request, res: Response) => {
  const { societyId } = req.params as { societyId: string };
  const result = await roleService.listRoles(societyId);
  sendSuccess(res, result);
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const { societyId, roleId } = req.params as { societyId: string; roleId: string };
  const role = await roleService.getRole(societyId, roleId);
  sendSuccess(res, role);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.context) throw ApiError.internal('Request context missing');
  const { societyId } = req.params as { societyId: string };
  const { name, description, permissions } = req.body as RoleBody;
  const role = await roleService.createRole(societyId, req.context.permissions, {
    name,
    description,
    permissions,
  });
  sendSuccess(res, role, { statusCode: StatusCodes.CREATED, message: 'Role created' });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  if (!req.context) throw ApiError.internal('Request context missing');
  const { societyId, roleId } = req.params as { societyId: string; roleId: string };
  const { name, description, permissions } = req.body as RoleBody;
  const role = await roleService.updateRole(societyId, roleId, req.context.permissions, {
    name,
    description,
    permissions,
  });
  sendSuccess(res, role, { message: 'Role updated' });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { societyId, roleId } = req.params as { societyId: string; roleId: string };
  await roleService.deleteRole(societyId, roleId);
  sendSuccess(res, null, { message: 'Role deleted' });
});
