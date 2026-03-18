import { PRIORITY } from "@/enums/priority.enum";
import type { Pagination } from "./pagination.interface";
import { STATUS } from "@/enums/status.enum";

export interface PaginateTodosPayload extends Pagination {
  title?: string;
  status?: STATUS;
  priority?: PRIORITY;
}

export interface CreateTodoPayload {
  title: string;
  description: string;
  priority?: PRIORITY;
  due_date?: string; // "2023-10-27T10:00:00Z"
}