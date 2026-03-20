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
import { StatusBadge } from "@/components/badges/status-badge";
import { PriorityBadge } from "@/components/badges/priority-badge";
import { OwnerBadge } from "@/components/badges/owner-badge";
import { Todo } from "@/models/todo.model";
import { useAuthStore } from "@/store/auth.store";
import { EyeIcon, TrashIcon } from "@phosphor-icons/react";

interface TodosListTableProps {
  todos?: Todo[];
  onViewTodo?: (todoId: string) => void;
  onDeleteTodo?: (todo: Todo) => void;
  onUpdateStatus?: (todo: Todo) => void;
}

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

export function TodosTable({ todos = [], onViewTodo, onDeleteTodo, onUpdateStatus }: TodosListTableProps) {
  const authUserId = useAuthStore((state) => state.user?.id);
  const safeTodos = Array.isArray(todos) ? todos : [];
  const isEmpty = safeTodos.length === 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Table className="w-full min-w-[800px] table-fixed" containerClassName="flex-1 overflow-auto">
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[21%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[10%]" />
        </colgroup>
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_hsl(var(--border))]">
          <TableRow className="hover:bg-transparent">
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
                    <StatusBadge 
                      status={todo.status}
                      className={`w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${todo.owner_id === authUserId ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}
                      isInteractive={todo.owner_id === authUserId}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (todo.owner_id === authUserId) onUpdateStatus?.(todo);
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-center overflow-hidden">
                    {todo.priority ? (
                      <PriorityBadge priority={todo.priority} className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">{formatDate(todo.due_date)}</TableCell>
                  <TableCell className="text-center overflow-hidden">
                    <OwnerBadge 
                      isOwner={todo.owner_id === authUserId}
                      className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                    />
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    {todo.owner_id === authUserId && (
                      <div className="flex items-center justify-center gap-2">
                        <Button aria-label="View todo" type="button" variant="outline" size="xs" onClick={() => onViewTodo?.(todo.id)}>
                          <EyeIcon/>
                        </Button>

                        <Button aria-label="Delete todo" type="button" variant="outline" size="xs" onClick={() => onDeleteTodo?.(todo)}>
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

      {isEmpty ? (
        <div className="flex-1 bg-card text-center text-muted-foreground flex items-center justify-center">
          No todos found.
        </div>
      ) : null}
    </div>
  )
}