import { test as base } from '@playwright/test';
import { apiRequest as apiRequestFn } from './plain-function';
import type { ApiRequestParams, ApiRequestResponse } from './api-types';

export type ApiRequestFn = <T>(
  params: Omit<ApiRequestParams, 'request'>
) => Promise<ApiRequestResponse<T>>;

type ApiFixtures = {
  apiRequest: ApiRequestFn;
};

/**
 * Playwright fixture wrapping plain-function.ts with the built-in `request`
 * context, so spec files call apiRequest({ method, url, ... }) without
 * threading `request` through every call.
 */
export const test = base.extend<ApiFixtures>({
  apiRequest: async ({ request }, use) => {
    await use((params) => apiRequestFn({ request, ...params }));
  },
});

export { expect } from '@playwright/test';
