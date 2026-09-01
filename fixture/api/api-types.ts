import type { APIRequestContext } from '@playwright/test';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestParams {
  request: APIRequestContext;
  method: HttpMethod;
  url: string;
  baseUrl?: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface ApiRequestResponse<T> {
  status: number;
  body: T;
}
