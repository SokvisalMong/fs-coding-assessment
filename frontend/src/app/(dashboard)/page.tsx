"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon, CircleNotchIcon, TableIcon, ListIcon } from "@phosphor-icons/react";
import { STATUS } from "@/enums/status.enum";
import { PRIORITY } from "@/enums/priority.enum";
import { Todo } from "@/models/todo.model";
import { deleteTodo, getTodo, paginateTodos, updateTodo } from "@/actions/todo";
import { toast } from "sonner";
import { 
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"; 
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group";
import { 
  Select,
  SelectTrigger, 
  SelectContent, 
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PaginationMeta } from "@/interfaces/pagination.interface";
import { PaginationControls } from "@/components/pagination";
import { TodosTable } from "@/components/table/todos";
import { TodosList } from "@/components/list/todos";
import { TodoForm } from "@/components/dialog/todo-form";
import { TodoDeleteDialog } from "@/components/dialog/todo-delete";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function Home() {
  const statusList = Object.values(STATUS).map((status) => ({
    label: status,
    value: status,
  }))

  const priorityList = Object.values(PRIORITY).map((priority) => ({
    label: priority,
    value: priority,
  }))

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const [view, setView] = useState<"table" | "list">("table");

  const [status, setStatus] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);
  const [todoDialogMode, setTodoDialogMode] = useState<"create" | "view" | "edit">("create");
  const [isTodoDialogLoading, setIsTodoDialogLoading] = useState(false);
  const [hasUnsavedTodoChanges, setHasUnsavedTodoChanges] = useState(false);
  const [isTodoDialogDiscardAlertOpen, setIsTodoDialogDiscardAlertOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>(undefined);
  const [isTodoDeleteDialogOpen, setIsTodoDeleteDialogOpen] = useState(false);
  const [todoPendingDelete, setTodoPendingDelete] = useState<Todo | undefined>(undefined);
  const todoViewRequestIdRef = useRef(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    items_per_page: 20
  })

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination({
      page: 1,
      limit,
    });
  };

  const fetchTodos = useCallback(async (options?: { append: boolean }) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      setIsLoading(true);
      const response = await paginateTodos({
        page: pagination.page,
        limit: pagination.limit,
        title: debouncedSearch || undefined,
        priority: priority === "all" ? undefined : priority as PRIORITY,
        status: status === "all" ? undefined : status as STATUS,
      })

      setTodos((prev) => options?.append ? [...prev, ...response.results] : response.results);
      setPaginationMeta(response.meta)
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, pagination.limit, pagination.page, priority, status])

  const pendingAppendRef = useRef(false);

  useEffect(() => {
    fetchTodos({ append: pendingAppendRef.current });
    pendingAppendRef.current = false;
  }, [fetchTodos]);

  const loadMore = useCallback(() => {
    if (isLoading || isFetchingRef.current) return;
    if (pagination.page < paginationMeta.total_pages) {
      pendingAppendRef.current = true;
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [isLoading, pagination.page, paginationMeta.total_pages]);

  useEffect(() => {
    // Reset page to 1 when filters or view changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, priority, status, view]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedSearch = search.trim();

      if (normalizedSearch.length >= 2) {
        setDebouncedSearch(normalizedSearch);
        return;
      }

      setDebouncedSearch("");
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleOptimisticTodoCreated = useCallback((todo: Todo) => {
    setTodos((prevTodos) => [todo, ...prevTodos].slice(0, pagination.limit));
    setPaginationMeta((prevMeta) => {
      const nextTotalCount = prevMeta.total_count + 1;

      return {
        ...prevMeta,
        total_count: nextTotalCount,
        total_pages: Math.max(1, Math.ceil(nextTotalCount / pagination.limit)),
      };
    });
  }, [pagination.limit]);

  const handleOptimisticTodoFailed = useCallback((optimisticTodoId: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== optimisticTodoId));
    setPaginationMeta((prevMeta) => {
      const nextTotalCount = Math.max(0, prevMeta.total_count - 1);

      return {
        ...prevMeta,
        total_count: nextTotalCount,
        total_pages: Math.max(1, Math.ceil(nextTotalCount / pagination.limit)),
      };
    });
  }, [pagination.limit]);

  const handleTodoCreateSuccess = useCallback(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleOptimisticTodoUpdated = useCallback((optimisticTodo: Todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === optimisticTodo.id ? optimisticTodo : todo))
    );
  }, []);

  const handleOptimisticTodoUpdateFailed = useCallback((originalTodo: Todo) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === originalTodo.id ? originalTodo : todo))
    );
  }, []);

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

      if (requestId !== todoViewRequestIdRef.current) {
        return;
      }

      setSelectedTodo(todo);
    } catch (error) {
      if (requestId !== todoViewRequestIdRef.current) {
        return;
      }

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

  const handleOptimisticTodoDeleted = useCallback((todoToDelete: Todo) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoToDelete.id));
    setPaginationMeta((prevMeta) => {
      const nextTotalCount = Math.max(0, prevMeta.total_count - 1);

      return {
        ...prevMeta,
        total_count: nextTotalCount,
        total_pages: Math.max(1, Math.ceil(nextTotalCount / pagination.limit)),
      };
    });
  }, [pagination.limit]);

  const handleOptimisticTodoDeleteFailed = useCallback((todoToRestore: Todo) => {
    setTodos((prevTodos) => {
      if (prevTodos.some((todo) => todo.id === todoToRestore.id)) {
        return prevTodos;
      }

      return [todoToRestore, ...prevTodos].slice(0, pagination.limit);
    });
    setPaginationMeta((prevMeta) => {
      const nextTotalCount = prevMeta.total_count + 1;

      return {
        ...prevMeta,
        total_count: nextTotalCount,
        total_pages: Math.max(1, Math.ceil(nextTotalCount / pagination.limit)),
      };
    });
  }, [pagination.limit]);

  const handleTodoDeleteSuccess = useCallback(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleUpdateTodoStatus = useCallback(async (todo: Todo) => {
    let newStatus: STATUS;
    if (todo.status === STATUS.IN_PROGRESS) {
      newStatus = STATUS.COMPLETED;
    } else if (todo.status === STATUS.COMPLETED) {
      newStatus = STATUS.IN_PROGRESS;
    } else {
      newStatus = STATUS.IN_PROGRESS;
    }

    const nextTodo = { ...todo, status: newStatus };
    const loadingToastId = toast.loading("Updating status...");
    
    // Optimistic update
    handleOptimisticTodoUpdated(nextTodo);
    
    try {
      await updateTodo(todo.id, { status: newStatus });
      toast.success("Status updated successfully", {
        id: loadingToastId,
      });
      fetchTodos();
    } catch (error) {
      handleOptimisticTodoUpdateFailed(todo);
      toast.error("Failed to update status", {
        id: loadingToastId,
        description: (error as Error).message,
      });

      toast.error("Request failed", {
        description: "Click retry to try again.",
        action: {
          label: "Retry",
          onClick: () => {
            void handleUpdateTodoStatus(todo);
          },
        },
      });
    }
  }, [handleOptimisticTodoUpdated, handleOptimisticTodoUpdateFailed, fetchTodos]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-col gap-2">
        {/* Search */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex flex-row gap-1">
            <InputGroup>
              <InputGroupInput 
                id="search" 
                placeholder="Search"
                value={search}
                autoComplete="off"
                onChange={(e) => setSearch(e.target.value)}
                />
              <InputGroupAddon>
                <MagnifyingGlassIcon />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {isLoading && 
                  <CircleNotchIcon className="animate-spin"/>
                }
              </InputGroupAddon>
            </InputGroup>
            <Button type="button" onClick={openCreateDialog}>Create</Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-4 sm:gap-0 mt-2">
          {/* Filter */}
          <div className="flex flex-row gap-4 sm:gap-2 w-full sm:w-auto">
            {/* Status */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" aria-label="Filter by Status" className="w-full sm:!min-w-32">
                  <SelectValue placeholder="Status"/>
                </SelectTrigger>
                <SelectContent className="!max-w-32 !min-w-32">
                  <SelectItem value="all">
                    All
                  </SelectItem>
                  {statusList.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Priority */}
            <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:flex-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger aria-label="Filter by Priority" className="w-full sm:!min-w-32">
                  <SelectValue placeholder="Priority"/>
                </SelectTrigger>
                <SelectContent className="!max-w-32 !min-w-32">
                  <SelectItem value="all">
                    All
                  </SelectItem>
                  {priorityList.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View */}
          <div className="flex w-full sm:w-auto mt-4 sm:mt-0 justify-end md:justify-start">
            <Tabs defaultValue="table" onValueChange={(value) => setView(value as "table" | "list")} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:inline-flex">
                <TabsTrigger value="table">
                  <TableIcon/>
                  Table
                </TabsTrigger>
                <TabsTrigger value="list">
                  <ListIcon/>
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`overflow-y-auto flex flex-col gap-2 ${view === "table" ? "h-[40vh]" : "h-[50vh]"}`}>
        {view === "table" && (
          <TodosTable todos={todos} onViewTodo={openViewDialog} onDeleteTodo={openDeleteDialog} onUpdateStatus={handleUpdateTodoStatus} />
        )}
        {view === "list" && (
          <TodosList 
            todos={todos} 
            onViewTodo={openViewDialog} 
            onDeleteTodo={openDeleteDialog} 
            onUpdateStatus={handleUpdateTodoStatus} 
            onLoadMore={loadMore} 
            hasMore={pagination.page < paginationMeta.total_pages}
            isLoading={isLoading}
          />
        )}
      </CardContent>
      {view === "table" && (
        <CardFooter>
          {/* Pagination controls */}
          <PaginationControls
            itemsPerPage={pagination.limit}
            totalPages={paginationMeta.total_pages}
            currentPage={pagination.page}
            itemCount={paginationMeta.total_count}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            />
        </CardFooter>
      )}

      <Dialog
        open={isTodoDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsTodoDialogOpen(true);
            return;
          }

          requestCloseTodoDialog();
        }}
      >
        <DialogContent>
          <TodoForm
            isOpen={isTodoDialogOpen}
            isTodoLoading={isTodoDialogLoading}
            mode={todoDialogMode}
            todo={selectedTodo}
            onOptimisticCreate={handleOptimisticTodoCreated}
            onCreateFailed={handleOptimisticTodoFailed}
            onOptimisticUpdate={handleOptimisticTodoUpdated}
            onUpdateFailed={handleOptimisticTodoUpdateFailed}
            onDirtyChange={setHasUnsavedTodoChanges}
            onCancel={requestCloseTodoDialog}
            onClose={performCloseTodoDialog}
            onSuccess={handleTodoCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isTodoDialogDiscardAlertOpen} onOpenChange={setIsTodoDialogDiscardAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={performCloseTodoDialog}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TodoDeleteDialog
        open={isTodoDeleteDialogOpen}
        todo={todoPendingDelete}
        onOpenChange={(open) => {
          if (open) {
            setIsTodoDeleteDialogOpen(true);
            return;
          }

          requestCloseDeleteDialog();
        }}
        onCancel={requestCloseDeleteDialog}
        onDelete={deleteTodo}
        onOptimisticDelete={handleOptimisticTodoDeleted}
        onOptimisticDeleteFailed={handleOptimisticTodoDeleteFailed}
        onSuccess={handleTodoDeleteSuccess}
      />
    </Card>
  )
}