export type ApiMethod = "get" | "post" | "put" | "patch" | "delete";

export type Primitive = string | number | boolean;
export type QueryValue = Primitive | null | undefined;

export interface ApiEnvelope<TData> {
	code: number;
	message: string;
	data: TData | null;
}

export interface PaginatedMeta {
	items_per_page: number;
	current_page: number;
	total_count: number;
	total_pages: number;
}

export interface PaginatedData<TResult> {
	meta: PaginatedMeta;
	results: TResult[];
}
