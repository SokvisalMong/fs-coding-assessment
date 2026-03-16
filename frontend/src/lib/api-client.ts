import type {
  ApiParams,
  ApiRequestOptions,
  ApiResponse,
} from "@/interfaces/api.interface";
import type { ApiMethod, QueryValue } from "@/types/api";

export type { ApiParams, ApiRequestOptions };
export type { ApiMethod, QueryValue };
export type ApiResult<TData> =
  | import("@/interfaces/api.interface").ApiSuccess<TData>
  | import("@/interfaces/api.interface").ApiFailure;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value: string): string {
  if (!value) return "";
  return value.startsWith("/") ? value : `/${value}`;
}

function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) return "";
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    searchParams.append(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function buildApiUrl(endpoint: string, query?: Record<string, QueryValue>): string {
  const origin = trimTrailingSlash(API_ORIGIN);
  const prefix = ensureLeadingSlash(trimTrailingSlash(API_PREFIX));
  const path = normalizeEndpoint(endpoint);
  const queryString = buildQueryString(query);
  return `${origin}${prefix}${path}${queryString}`;
}

function shouldSerializeJson(body: unknown): boolean {
  if (!body) return false;
  if (typeof body !== "object") return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return true;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.includes("text/")) {
    return response.text();
  }

  return null;
}

function buildRequestHeaders(
  headers?: HeadersInit,
  token?: string,
  includeJsonContentType?: boolean,
): Headers {
  const result = new Headers(headers);

  if (includeJsonContentType && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }

  if (token && !result.has("Authorization")) {
    result.set("Authorization", `Bearer ${token}`);
  }

  return result;
}

export async function apiRequest<TData, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody>,
): Promise<TData> {
  const response = await apiRequestWithMeta<TData, TBody>(endpoint, options);
  return response.data;
}

async function apiRequestWithMeta<TData, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody>,
): Promise<ApiResponse<TData>> {
  const { method, body, headers, query, token, cache, next } = options;

  if (!method) {
    throw new Error("API method is required");
  }

  const normalizedMethod = method;

  const serializedBody = shouldSerializeJson(body) ? JSON.stringify(body) : body;
  const requestHeaders = buildRequestHeaders(
    headers,
    token,
    shouldSerializeJson(body),
  );

  const response = await fetch(buildApiUrl(endpoint, query), {
    method: normalizedMethod,
    headers: requestHeaders,
    body: serializedBody as BodyInit | null | undefined,
    cache,
    next,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof (payload as { detail?: unknown }).detail === "string"
        ? ((payload as { detail: string }).detail ?? "Request failed")
        : response.statusText || "Request failed";

    throw new ApiError(response.status, message, payload);
  }

  return {
    status: response.status,
    data: payload as TData,
  };
}

export async function apiSafeRequest<TData, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody>,
): Promise<ApiResult<TData>> {
  try {
    const response = await apiRequestWithMeta<TData, TBody>(endpoint, options);
    return {
      ok: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        status: error.status,
        message: error.message,
        error: error.payload,
      };
    }

    return {
      ok: false,
      status: 500,
      message: "Unexpected API error",
      error,
    };
  }
}

export async function api<TData, TBody = unknown>(
  params: ApiParams<TBody>,
): Promise<TData> {
  const { endpoint, ...options } = params;
  return apiRequest<TData, TBody>(endpoint, options);
}

