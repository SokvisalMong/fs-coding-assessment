"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Todo } from "@/models/todo.model";
import { PRIORITY } from "@/enums/priority.enum";
import { STATUS } from "@/enums/status.enum";
import { useAuthStore } from "@/store/auth.store";
import { EyeIcon, TrashIcon, CircleNotchIcon } from "@phosphor-icons/react";

interface TodosListProps {
  todos?: Todo[];
  onViewTodo?: (todoId: string) => void;
  onDeleteTodo?: (todo: Todo) => void;
  onUpdateStatus?: (todo: Todo) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
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

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export function TodosList({ todos = [], onViewTodo, onDeleteTodo, onUpdateStatus, onLoadMore, hasMore, isLoading }: TodosListProps) {
  const authUserId = useAuthStore((state) => state.user?.id);
  const safeTodos = Array.isArray(todos) ? todos : [];
  const isEmpty = safeTodos.length === 0;
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore?.();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className="h-full flex flex-col gap-4">
      {isEmpty && !isLoading ? (
        <div className="flex-1 bg-card text-center text-muted-foreground flex items-center justify-center min-h-[10rem]">
          No todos found.
        </div>
      ) : (
        <>
          {safeTodos.map((todo, index) => {
            const isLast = index === safeTodos.length - 1;
            return (
              <div 
                key={todo.id} 
                ref={isLast ? lastElementRef : null}
                className="relative flex flex-col gap-3 rounded-lg border p-4 shadow-sm bg-card hover:bg-accent/10 transition-colors"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground hidden sm:inline">Status:</span>
                  <Badge 
                    className={`${statusClassMap[todo.status]} ${todo.owner_id === authUserId ? "cursor-pointer hover:opacity-80" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (todo.owner_id === authUserId) onUpdateStatus?.(todo);
                    }}
                  >
                    {formatLabel(todo.status)}
                  </Badge>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex-1 min-w-0 w-full pr-24 sm:pr-28">
                    <h3 className="font-semibold text-lg truncate">{todo.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1 min-h-[1.25rem]">
                      {todo.description || "HIDDEN"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {todo.priority && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge className={`${priorityClassMap[todo.priority]}`}>
                          {formatLabel(todo.priority)}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      {todo.owner_id === authUserId ? (
                        <Badge className="bg-emerald-200 text-emerald-800">You</Badge>
                      ) : (
                        <Badge className="bg-slate-200 text-slate-800">Other</Badge>
                      )}
                    </div>
                  </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 text-sm">
              <div className="text-muted-foreground flex items-center gap-1">
                {todo.due_date ? (
                  <>
                    <span className="font-medium">Due:</span> 
                    {formatDate(todo.due_date)}
                  </>
                ) : null}
              </div>
              
              {todo.owner_id === authUserId && (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-8 shadow-none" onClick={() => onViewTodo?.(todo.id)}>
                    <EyeIcon className="mr-1.5"/>
                    View
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8 shadow-none" onClick={() => onDeleteTodo?.(todo)}>
                    <TrashIcon className="mr-1.5"/>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-center p-4">
              <CircleNotchIcon className="animate-spin text-muted-foreground w-6 h-6" />
            </div>
          )}
        </>
      )}
    </div>
  );
}