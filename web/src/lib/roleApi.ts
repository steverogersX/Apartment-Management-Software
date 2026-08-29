import type { RoleResponse } from "@shared/index";
import {
  mockCreateRole,
  mockDeleteRole,
  mockGetRole,
  mockListRoles,
  mockUpdateRole,
} from "@/lib/mockBackend";

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export function listRolesRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
): Promise<RoleResponse[]> {
  return mockListRoles(societyId);
}

export function getRoleRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
  roleId: string,
): Promise<RoleResponse> {
  return mockGetRole(societyId, roleId);
}

export function createRoleRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
  data: RoleInput,
): Promise<RoleResponse> {
  return mockCreateRole(societyId, data);
}

export function updateRoleRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
  roleId: string,
  data: RoleInput,
): Promise<RoleResponse> {
  return mockUpdateRole(societyId, roleId, data);
}

export function deleteRoleRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
  roleId: string,
): Promise<null> {
  return mockDeleteRole(societyId, roleId);
}
