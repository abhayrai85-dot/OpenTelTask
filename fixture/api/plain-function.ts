import type { ApiRequestParams, ApiRequestResponse } from './api-types';

/**
 * Core HTTP call shared by the apiRequest fixture. Response bodies on this
 * app are not always JSON -- error paths return a plain-text
 * "Internal Server Error" (see references/troubleshooting.md) -- so a failed
 * JSON parse falls back to the raw text instead of throwing.
 */
export async function apiRequest<T>({
  request,
  method,
  url,
  baseUrl,
  params,
  body,
}: ApiRequestParams): Promise<ApiRequestResponse<T>> {
  const fullUrl = new URL(url, baseUrl ?? undefined);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      fullUrl.searchParams.set(key, value);
    }
  }

  console.log(`[apiRequest] --> ${method} ${fullUrl.toString()}`, body ? { body } : '');

  const response = await request.fetch(fullUrl.toString(), {
    method,
    data: body,
  });

  const status = response.status();
  const raw = await response.text();

  let parsed: unknown = null;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  console.log(`[apiRequest] <-- ${status} ${method} ${fullUrl.toString()}`, { body: parsed });

  return { status, body: parsed as T };
}
