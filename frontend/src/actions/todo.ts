"use server";

import type { 
  PaginateTodosPayload,
  CreateTodoPayload
} from "@/interfaces/todo.interface";
import { Todo } from "@/models/todo.model";
import { apiRequest } from "@/lib/api.server";
import { Paginate } from "@/interfaces/pagination.interface";

export async function paginateTodos(payload: PaginateTodosPayload) {
  const response = await apiRequest<Paginate<Todo>>({
    method: "get",
    endpoint: "todos",
    data: payload,
  })

  return response.data;
}

export async function createTodo(payload: CreateTodoPayload) {
  const response = await apiRequest<Todo>({
    method: "post",
    endpoint: "todos",
    data: payload,
  })

  return response.data;
}

export async function getTodo(id: string) {
  const response = await apiRequest<Todo>({
    method: "get",
    endpoint: `todos/${id}`,
  })

  return response.data;
}

export async function deleteTodo(id: string) {
  await apiRequest({
    method: "delete",
    endpoint: `todos/${id}`
  })
}