import "server-only";

import { apiRequest, type ApiRequestOptions } from "@/lib/api-client";

export async function serverApiRequest<TData, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TData> {
  return apiRequest<TData, TBody>(endpoint, {
    ...options,
    cache: options.cache ?? "no-store",
  });
}
