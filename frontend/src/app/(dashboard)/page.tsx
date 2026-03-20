"use client"

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { MagnifyingGlassIcon, CircleNotchIcon, TableIcon, ListIcon } from "@phosphor-icons/react";
import { STATUS } from "@/enums/status.enum";
import { PRIORITY } from "@/enums/priority.enum";
import { Todo } from "@/models/todo.model";
import { deleteTodo, updateTodo } from "@/actions/todo";
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
import { PaginationControls } from "@/components/pagination";
import { TodosTable } from "@/components/table/todos";
import { TodosList } from "@/components/list/todos";
import { TodoForm } from "@/components/dialog/todo-form";
import { TodoDeleteDialog } from "@/components/dialog/todo-delete";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import { TodoDiscardAlert } from "@/components/dialog/todo-discard-alert";

import { useTodos } from "@/hooks/use-todos";
import { useTodoDialogs } from "@/hooks/use-todo-dialogs";
import { useViewMode } from "@/hooks/use-view-mode";

export default function Home() {
  const statusList = Object.values(STATUS).map((status) => ({
    label: status,
    value: status,
  }))

  const priorityList = Object.values(PRIORITY).map((priority) => ({
    label: priority,
    value: priority,
  }))

  const { view, setView } = useViewMode("table");

  const {
    todos,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    isLoading,
    pagination,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    loadMore,
    fetchTodos,
    handleOptimisticTodoCreated,
    handleOptimisticTodoFailed,
    handleOptimisticTodoUpdated,
    handleOptimisticTodoUpdateFailed,
    handleOptimisticTodoDeleted,
    handleOptimisticTodoDeleteFailed,
    resetPaginationAndRefetch,
  } = useTodos();

  const {
    isTodoDialogOpen,
    setIsTodoDialogOpen,
    todoDialogMode,
    isTodoDialogLoading,
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
    
    requestCloseDeleteDialog,
    openDeleteDialog,
  } = useTodoDialogs();

  const handleTodoCreateSuccess = useCallback(() => {
    fetchTodos();
  }, [fetchTodos]);

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
            <Tabs 
              value={view} 
              onValueChange={(value) => {
                setView(value as "table" | "list");
                resetPaginationAndRefetch();
              }} 
              className="w-full sm:w-auto"
            >
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
      <CardContent className={`flex flex-col gap-2 ${view === "table" ? "h-[40vh] overflow-hidden" : "h-[50vh] overflow-y-auto overscroll-contain"}`}>
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

      <TodoDiscardAlert
        open={isTodoDialogDiscardAlertOpen}
        onOpenChange={setIsTodoDialogDiscardAlertOpen}
        onDiscard={performCloseTodoDialog}
      />

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
