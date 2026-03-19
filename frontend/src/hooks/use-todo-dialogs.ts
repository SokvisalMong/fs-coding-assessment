import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Todo } from "@/models/todo.model";
import { getTodo } from "@/actions/todo";

export function useTodoDialogs() {
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);
  const [todoDialogMode, setTodoDialogMode] = useState<"create" | "view" | "edit">("create");
  const [isTodoDialogLoading, setIsTodoDialogLoading] = useState(false);
  const [hasUnsavedTodoChanges, setHasUnsavedTodoChanges] = useState(false);
  const [isTodoDialogDiscardAlertOpen, setIsTodoDialogDiscardAlertOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>(undefined);
  
  const [isTodoDeleteDialogOpen, setIsTodoDeleteDialogOpen] = useState(false);
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | undefined>(undefined);
  
  const todoViewRequestIdRef = useRef(0);

  const performCloseTodoDialog = useCallback(() => {
    setIsTodoDialogOpen(false);
    todoViewRequestIdRef.current += 1;
    setSelectedTodo(undefined);
    setIsTodoDialogLoading(false);
    setHasUnsavedTodoChanges(false);
    setIsTodoDialogDiscardAlertOpen(false);
  }, []);

  const requestCloseTodoDialog = useCallback(() => {
    if (hasUnsavedTodoChanges) {
      setIsTodoDialogDiscardAlertOpen(true);
      return;
    }
    performCloseTodoDialog();
  }, [hasUnsavedTodoChanges, performCloseTodoDialog]);

  const openCreateDialog = useCallback(() => {
    todoViewRequestIdRef.current += 1;
    setTodoDialogMode("create");
    setSelectedTodo(undefined);
    setIsTodoDialogLoading(false);
    setHasUnsavedTodoChanges(false);
    setIsTodoDialogDiscardAlertOpen(false);
    setIsTodoDialogOpen(true);
  }, []);

  const openViewDialog = useCallback(async (todoId: string) => {
    todoViewRequestIdRef.current += 1;
    const requestId = todoViewRequestIdRef.current;

    setTodoDialogMode("view");
    setSelectedTodo(undefined);
    setIsTodoDialogLoading(true);
    setHasUnsavedTodoChanges(false);
    setIsTodoDialogDiscardAlertOpen(false);
    setIsTodoDialogOpen(true);

    try {
      const todo = await getTodo(todoId);
      if (requestId !== todoViewRequestIdRef.current) return;
      setSelectedTodo(todo);
    } catch (error) {
      if (requestId !== todoViewRequestIdRef.current) return;
      toast.error("Failed to fetch todo", {
        description: (error as Error).message,
      });
      performCloseTodoDialog();
    } finally {
      if (requestId === todoViewRequestIdRef.current) {
        setIsTodoDialogLoading(false);
      }
    }
  }, [performCloseTodoDialog]);

  const performCloseDeleteDialog = useCallback(() => {
    setIsTodoDeleteDialogOpen(false);
    setTodoPendingDelete(undefined);
  }, []);

  const requestCloseDeleteDialog = useCallback(() => {
    performCloseDeleteDialog();
  }, [performCloseDeleteDialog]);

  const openDeleteDialog = useCallback((todo: Todo) => {
    setTodoPendingDelete(todo);
    setIsTodoDeleteDialogOpen(true);
  }, []);

  return {
    isTodoDialogOpen,
    setIsTodoDialogOpen,
    todoDialogMode,
    isTodoDialogLoading,
    hasUnsavedTodoChanges,
    setHasUnsavedTodoChanges,
    isTodoDialogDiscardAlertOpen,
    setIsTodoDialogDiscardAlertOpen,
    selectedTodo,
    
    isTodoDeleteDialogOpen,
    setIsTodoDeleteDialogOpen,
    todoPendingDelete,

    performCloseTodoDialog,
    requestCloseTodoDialog,
    openCreateDialog,
    openViewDialog,
    
    performCloseDeleteDialog,
    requestCloseDeleteDialog,
    openDeleteDialog,
  };
}
