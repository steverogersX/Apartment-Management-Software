import type { ApiResponse } from "@shared/index";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9090/api/v1";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  societyToken?: string | null;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, societyToken, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(societyToken ? { "X-Society-Token": societyToken } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const envelope = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok || !envelope || !envelope.success) {
    throw new ApiClientError(
      envelope?.error?.message ?? envelope?.message ?? "Request failed",
      res.status,
      envelope?.error?.code,
    );
  }

  return envelope.data as T;
}
