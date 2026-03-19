"use client";

import { 
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Todo } from "@/models/todo.model";
import { PRIORITY } from "@/enums/priority.enum";
import { STATUS } from "@/enums/status.enum";
import { useAuthStore } from "@/store/auth.store";

interface TodosListTableProps {
  todos?: Todo[];
  isLoading?: boolean;
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

  return parsedDate.toLocaleDateString();
};

export function TodosTable({ todos = [], isLoading = false }: TodosListTableProps) {
  const authUserId = useAuthStore((state) => state.user?.id);
  const safeTodos = Array.isArray(todos) ? todos : [];
  const isEmpty = !isLoading && safeTodos.length === 0;

  return (
    <div className="h-full flex flex-col">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">Title</TableHead>
            <TableHead className="w-[26%]">Description</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Priority</TableHead>
            <TableHead className="text-center">Due Date</TableHead>
            <TableHead className="text-center">Owner</TableHead>
          </TableRow>
        </TableHeader>
        {!isEmpty || !isLoading ? (
          <TableBody>

            {!isLoading
              ? safeTodos.map((todo) => (
                  <TableRow key={todo.id}>
                    <TableCell className="font-medium max-w-0 truncate">{todo.title}</TableCell>
                    <TableCell className="max-w-0 truncate text-muted-foreground">
                      {todo.description || "HIDDEN"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusClassMap[todo.status]}>{formatLabel(todo.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {todo.priority ? (
                        <Badge className={priorityClassMap[todo.priority]}>
                          {formatLabel(todo.priority)}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center">{formatDate(todo.due_date)}</TableCell>
                    <TableCell className="text-center">
                      {todo.owner_id === authUserId ? (
                        <Badge className="bg-emerald-200 text-emerald-800">You</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-800">Other</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        ) : null}
      </Table>

      {isEmpty || isLoading ? (
        <div className="flex-1 bg-card text-center text-muted-foreground flex items-center justify-center">
          {isLoading ? "Loading todos..." : "No todos found."}
        </div>
      ) : null}
    </div>
  )
}