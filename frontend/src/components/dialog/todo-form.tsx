"use client";

import { Todo } from "@/models/todo.model";
import * as z from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { PRIORITY } from "@/enums/priority.enum";
import { STATUS } from "@/enums/status.enum";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { createTodo, updateTodo } from "@/actions/todo";
import { useAuthStore } from "@/store/auth.store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  InputGroup,
  InputGroupTextarea,
  InputGroupInput
} from "@/components/ui/input-group";
import { 
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from "@/components/ui/field";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { CalendarBlankIcon, CircleNotchIcon } from "@phosphor-icons/react";

interface TodoFormProps {
  isOpen: boolean;
  isTodoLoading?: boolean;
  todo?: Todo;
  mode: "create" | "view" | "edit";
  onOptimisticCreate: (todo: Todo) => void;
  onCreateFailed: (optimisticTodoId: string) => void;
  onOptimisticUpdate: (todo: Todo) => void;
  onUpdateFailed: (todo: Todo) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onCancel: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

const priorityList = Object.values(PRIORITY).map((priority) => ({
  label: priority,
  value: priority,
}))

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(1, "Description is required"),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"] as PRIORITY[])
    .optional(),
  dueDate: z
    .string()
    .optional()
})

type TodoFormValues = z.infer<typeof formSchema>;

const getDefaultValues = (todo?: Todo): TodoFormValues => ({
  title: todo?.title ?? "",
  description: todo?.description ?? "",
  priority: todo?.priority ?? undefined,
  dueDate: todo?.due_date ?? "",
});

export function TodoForm({
  isOpen,
  isTodoLoading = false,
  todo,
  mode,
  onOptimisticCreate,
  onCreateFailed,
  onOptimisticUpdate,
  onUpdateFailed,
  onDirtyChange,
  onCancel,
  onClose,
  onSuccess,
}: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(mode === "view");
  const authUserId = useAuthStore((state) => state.user?.id);
  const isTodoDataLoading = mode !== "create" && isTodoLoading;

  const runMutation = async (data: TodoFormValues, isRetry = false) => {
    if (isReadOnly) {
      return;
    }

    if (mode === "edit" && !todo) {
      toast.error("Todo item not found for editing.");
      return;
    }

    const isCreateMode = mode === "create";
    let optimisticTodoId = "";

    if (isCreateMode) {
      optimisticTodoId = `optimistic-${crypto.randomUUID()}`;
      const optimisticTimestamp = new Date().toISOString();
      const optimisticTodo: Todo = {
        id: optimisticTodoId,
        title: data.title,
        description: data.description,
        status: STATUS.NOT_STARTED,
        priority: data.priority ?? null,
        due_date: data.dueDate || null,
        owner_id: authUserId ?? "",
        created_at: optimisticTimestamp,
        updated_at: optimisticTimestamp,
      };
      onOptimisticCreate(optimisticTodo);
    } else if (todo) {
      onOptimisticUpdate({
        ...todo,
        title: data.title,
        description: data.description,
        priority: data.priority ?? null,
        due_date: data.dueDate || null,
        updated_at: new Date().toISOString(),
      });
    }

    if (!isRetry) {
      onDirtyChange?.(false);
      onClose();
    }

    const loadingToastId = toast.loading(isCreateMode ? "Creating todo..." : "Updating todo...");

    try {
      setIsLoading(true);
      form.clearErrors("root");

      if (isCreateMode) {
        await createTodo({
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate || undefined,
        });
      } else if (todo) {
        await updateTodo(todo.id, {
          title: data.title,
          description: data.description,
          priority: data.priority,
          due_date: data.dueDate || undefined,
        });
      }

      toast.success(isCreateMode ? "Todo created successfully" : "Todo updated successfully", {
        id: loadingToastId,
      });
      form.reset(getDefaultValues());
      onSuccess();
    } catch (error) {
      if (isCreateMode && optimisticTodoId) {
        onCreateFailed(optimisticTodoId);
      }

      if (!isCreateMode && todo) {
        onUpdateFailed(todo);
      }

      toast.error(isCreateMode ? "Failed to create todo" : "Failed to update todo", {
        id: loadingToastId,
        description: (error as Error).message,
      });

      toast.error("Request failed", {
        description: "Click retry to try again with the same data.",
        action: {
          label: "Retry",
          onClick: () => {
            void runMutation(data, true);
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(todo),
  })
  const hasUnsavedChanges = isOpen && !isReadOnly && !isTodoDataLoading && form.formState.isDirty;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsReadOnly(mode === "view");

    if (isTodoDataLoading) {
      form.clearErrors();
      setIsLoading(false);
      onDirtyChange?.(false);
      return;
    }

    const defaults = getDefaultValues(todo);

    form.reset(defaults, {
      keepDirty: false,
      keepTouched: false,
      keepSubmitCount: false,
      keepIsSubmitted: false,
      keepErrors: false,
    });
    form.clearErrors();
    setIsLoading(false);
    onDirtyChange?.(false);
  }, [form, isOpen, isTodoDataLoading, mode, onDirtyChange, todo]);

  useEffect(() => {
    if (!isOpen || isReadOnly || isTodoDataLoading) {
      onDirtyChange?.(false);
      return;
    }

    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, isOpen, isReadOnly, isTodoDataLoading, onDirtyChange]);

  const onSubmit = async (data: TodoFormValues) => {
    if (isReadOnly || isTodoDataLoading) {
      return;
    }

    await runMutation(data);
  }

  const handleEnableEdit = () => {
    onDirtyChange?.(false);
    setIsReadOnly(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Create Todo" : isReadOnly ? "View Todo" : "Edit Todo"}
        </DialogTitle>
      </DialogHeader>

      {isTodoDataLoading ? (
        <>
          <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground">
            <CircleNotchIcon className="animate-spin" />
            <span>Loading todo...</span>
          </div>

          <DialogFooter className="flex-row justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Close</Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <FieldGroup>
            {/* Title */}
            <Field>
              <FieldLabel>Title</FieldLabel>
              <InputGroup>
                <InputGroupInput 
                  {...form.register('title')}
                  readOnly={isReadOnly}
                  placeholder="Title" 
                  autoComplete="off"
                />
              </InputGroup>
              <FieldError>
                {form.formState.errors.title?.message}
              </FieldError>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel>Description</FieldLabel>
              <InputGroup>
                <InputGroupTextarea required
                  {...form.register('description')}
                  readOnly={isReadOnly}
                  placeholder="Description"
                  autoComplete="off"
                />
              </InputGroup>
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>

            <div className="flex flex-row w-full gap-2">
              {/* Priority */}
              <Field>
                <FieldLabel>Priority</FieldLabel>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) => {
                    const nextValue = value as PRIORITY;
                    if (form.getValues("priority") === nextValue) {
                      return;
                    }
                    form.setValue("priority", nextValue, { shouldDirty: true, shouldTouch: true });
                  }}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={`w-full ${isReadOnly ? "disabled:opacity-100" : ""}`}>
                    <SelectValue placeholder="Select Priority"/>
                  </SelectTrigger>
                  <SelectContent>
                    {priorityList.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))} 
                  </SelectContent>
                </Select>
              </Field>

              {/* Due Date */}
              <Field>
                <FieldLabel>Due Date</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isReadOnly}
                      data-empty={form.watch("dueDate") ? "false" : "true"}
                      className={`justify-start text-left font-normal data-[empty=true]:text-muted-foreground ${isReadOnly ? "disabled:opacity-100" : ""}`}
                    >
                      <CalendarBlankIcon/>
                      {form.watch("dueDate") ? new Date(form.watch("dueDate")!).toLocaleDateString() : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch("dueDate") ? new Date(form.watch("dueDate")!) : undefined}
                      onSelect={(date) => {
                        const nextValue = date?.toISOString() ?? "";
                        if (form.getValues("dueDate") === nextValue) {
                          return;
                        }
                        form.setValue("dueDate", nextValue, { shouldDirty: true, shouldTouch: true });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </FieldGroup>

          <FieldError>
            {form.formState.errors.root?.message}
          </FieldError>
          
          <DialogFooter className="flex-row justify-between">
            <div>
              {mode !== "create" && isReadOnly && todo?.owner_id === authUserId ? (
                <Button type="button" variant="outline" onClick={handleEnableEdit}>
                  Edit
                </Button>
              ) : null}
            </div>

            <div className="flex flex-row gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>{isReadOnly ? "Close" : "Cancel"}</Button>

              {!isReadOnly ? (
                <Button type="submit" disabled={isLoading}>
                  {mode === "create" ? "Create" : "Save"}
                  {isLoading ? <CircleNotchIcon data-icon="inline-end" className="animate-spin" /> : null}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </>
      )}
    </form>
  )
}