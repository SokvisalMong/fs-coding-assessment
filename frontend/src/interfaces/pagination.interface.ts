export interface Pagination {
  limit: number;
  page: number;
}

export interface PaginationMeta {
  items_per_page: number;
  current_page: number;
  total_count: number;
  total_pages: number;
}

export interface Paginate<Data> {
  meta: PaginationMeta;
  data: Data[];
}