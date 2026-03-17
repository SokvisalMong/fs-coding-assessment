import type {
	ApiEnvelope,
	ApiMethod,
	PaginatedData,
	PaginatedMeta,
	QueryValue,
} from "@/types/api";

export interface ApiRequestOptions<TBody = unknown> {
	method: ApiMethod;
	body?: TBody;
	headers?: HeadersInit;
	query?: Record<string, QueryValue>;
	token?: string;
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
}

export interface ApiSuccess<TData> {
	ok: true;
	status: number;
	data: TData | null;
}

export interface ApiFailure {
	ok: false;
	status: number;
	message: string;
	error: unknown;
}

export interface ApiParams<TBody = unknown> extends ApiRequestOptions<TBody> {
	endpoint: string;
}

export interface ApiResponse<TData> {
	status: number;
	data: TData | null;
}

export type StandardApiResponse<TData> = ApiEnvelope<TData>;
export type StandardPaginatedData<TResult> = PaginatedData<TResult>;
export type StandardPaginationMeta = PaginatedMeta;
