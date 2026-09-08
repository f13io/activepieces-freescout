import { httpClient, HttpMethod, QueryParams } from '@activepieces/pieces-common';
import { HttpResponse } from '@activepieces/pieces-common';

export type FreescoutAuthProps = {
  baseUrl: string;
  apiKey: string;
};

export async function freescoutApiCall<T = unknown>({
  auth,
  method,
  resourceUri,
  query,
  body,
}: {
  auth: FreescoutAuthProps;
  method: HttpMethod;
  resourceUri: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}): Promise<HttpResponse<T>> {
  const queryParams: QueryParams = {};
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    }
  }

  return httpClient.sendRequest<T>({
    method,
    url: `${auth.baseUrl.replace(/\/+$/, '')}/api${resourceUri}`,
    headers: {
      'X-FreeScout-API-Key': auth.apiKey,
    },
    queryParams,
    body,
  });
}

export function getResourceId(response: HttpResponse<unknown>): string | undefined {
  const headers = response.headers ?? {};
  const raw = headers['resource-id'] ?? headers['Resource-ID'];
  return Array.isArray(raw) ? raw[0] : raw;
}

// Drop undefined/empty-string values so optional props don't overwrite
// existing FreeScout data with nulls on partial updates.
export function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined && value !== ''),
  ) as Partial<T>;
}

// FreeScout matches a "customer" object by id (preferred — reuses the full
// existing record) or falls back to email/firstName, which FreeScout ignores
// entirely once the email already resolves to an existing customer.
export function buildCustomerRef(params: {
  customerId?: number;
  email?: string;
  firstName?: string;
}): Record<string, unknown> {
  if (params.customerId) {
    return { id: params.customerId };
  }
  return stripEmpty({ email: params.email, firstName: params.firstName });
}
