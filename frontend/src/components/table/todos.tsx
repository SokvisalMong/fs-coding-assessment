"use client";

import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Todo } from "@/models/todo.model";
import { PRIORITY } from "@/enums/priority.enum";
import { STATUS } from "@/enums/status.enum";
import { useAuthStore } from "@/store/auth.store";
import { EyeIcon, TrashIcon } from "@phosphor-icons/react";

interface TodosListTableProps {
  todos?: Todo[];
  onViewTodo?: (todoId: string) => void;
  onDeleteTodo?: (todo: Todo) => void;
}

const statusClassMap: Record<STATUS, string> = {
  [STATUS.NOT_STARTED]: "bg-slate-200 text-slate-800",
  [STATUS.IN_PROGRESS]: "bg-blue-200 text-blue-800",
  [STATUS.COMPLETED]: "bg-emerald-200 text-emerald-800",
};

const priorityClassMap: Record<PRIORITY, string> = {
  [PRIORITY.LOW]: "bg-zinc-200 text-zinc-800",
  [PRIORITY.MEDIUM]: "bg-amber-200 text-amber-800",
  [PRIORITY.HIGH]: "bg-rose-200 text-rose-800",
};

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export function TodosTable({ todos = [], onViewTodo, onDeleteTodo }: TodosListTableProps) {
  const authUserId = useAuthStore((state) => state.user?.id);
  const safeTodos = Array.isArray(todos) ? todos : [];
  const isEmpty = safeTodos.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="w-full overflow-x-auto">
        <Table className="w-fulltable-fixed">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[21%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead className="text-center">Due Date</TableHead>
              <TableHead className="text-center">Owner</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {!isEmpty ? (
            <TableBody>
              {safeTodos.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell className="font-medium max-w-0 truncate">{todo.title}</TableCell>
                  <TableCell className="max-w-0 truncate text-muted-foreground">
                    {todo.description || "HIDDEN"}
                  </TableCell>
                  <TableCell className="text-center overflow-hidden">
                    <Badge className={`${statusClassMap[todo.status]} max-w-full overflow-hidden text-ellipsis whitespace-nowrap`}>
                      {formatLabel(todo.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center overflow-hidden">
                    {todo.priority ? (
                      <Badge className={`${priorityClassMap[todo.priority]} max-w-full overflow-hidden text-ellipsis whitespace-nowrap`}>
                        {formatLabel(todo.priority)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">{formatDate(todo.due_date)}</TableCell>
                  <TableCell className="text-center overflow-hidden">
                    {todo.owner_id === authUserId ? (
                      <Badge className="bg-emerald-200 text-emerald-800 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">You</Badge>
                    ) : (
                      <Badge className="bg-slate-200 text-slate-800 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">Other</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {todo.owner_id === authUserId && (
                      <div className="flex items-center justify-center gap-2">
                        <Button type="button" variant="outline" size="xs" onClick={() => onViewTodo?.(todo.id)}>
                          <EyeIcon/>
                        </Button>

                        <Button type="button" variant="outline" size="xs" onClick={() => onDeleteTodo?.(todo)}>
                          <TrashIcon/>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : null}
        </Table>
      </div>

      {isEmpty ? (
        <div className="flex-1 bg-card text-center text-muted-foreground flex items-center justify-center">
          No todos found.
        </div>
      ) : null}
    </div>
  )
}