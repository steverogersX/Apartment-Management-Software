import type { CreateUserBody, EditUserBody, UserResponse } from "@shared/index";
import { mockCreateUser, mockEditUser } from "@/lib/mockBackend";

export function createUserRequest(
  _token: string,
  _societyToken: string,
  societyId: string,
  data: CreateUserBody,
): Promise<UserResponse> {
  return mockCreateUser(societyId, { name: data.name, email: data.email, roleIds: data.roleIds });
}

export function editUserRequest(
  _token: string,
  _societyToken: string,
  _societyId: string,
  userId: string,
  data: EditUserBody,
): Promise<UserResponse> {
  return mockEditUser(userId, {
    name: data.name,
    roleIds: data.roleIds,
  });
}
