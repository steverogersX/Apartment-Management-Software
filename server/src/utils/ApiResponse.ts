import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ApiResponse, ApiResponseError, ApiResponseMeta } from '@shared/index';

interface SuccessOptions {
  statusCode?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

interface ErrorOptions {
  statusCode?: number;
  code?: string;
  details?: unknown;
  meta?: Record<string, unknown>;
}

function buildMeta(meta?: Record<string, unknown>): ApiResponseMeta {
  return { timestamp: new Date().toISOString(), ...meta };
}

export function sendSuccess<T>(res: Response, data: T, options: SuccessOptions = {}): void {
  const statusCode = options.statusCode ?? StatusCodes.OK;
  const body: ApiResponse<T> = {
    success: true,
    statusCode,
    message: options.message ?? 'Success',
    data: data ?? null,
    error: null,
    meta: buildMeta(options.meta),
  };
  res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, options: ErrorOptions = {}): void {
  const statusCode = options.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const error: ApiResponseError = {
    message,
    ...(options.code !== undefined ? { code: options.code } : {}),
    ...(options.details !== undefined ? { details: options.details } : {}),
  };
  const body: ApiResponse<null> = {
    success: false,
    statusCode,
    message,
    data: null,
    error,
    meta: buildMeta(options.meta),
  };
  res.status(statusCode).json(body);
}
