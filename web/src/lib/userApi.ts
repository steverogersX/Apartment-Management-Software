import type { CreateUserBody, EditUserBody, UserResponse } from "@shared/index";
import { apiFetch } from "@/lib/apiClient";

export function createUserRequest(
  token: string,
  societyToken: string,
  societyId: string,
  data: CreateUserBody,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/societies/${societyId}/createUser`, {
    method: "POST",
    token,
    societyToken,
    body: data,
  });
}

export function editUserRequest(
  token: string,
  societyToken: string,
  societyId: string,
  userId: string,
  data: EditUserBody,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/societies/${societyId}/editUser/${userId}`, {
    method: "PUT",
    token,
    societyToken,
    body: data,
  });
}
