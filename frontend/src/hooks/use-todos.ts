import { useState, useRef, useCallback, useEffect } from "react";
import { Todo } from "@/models/todo.model";
import { paginateTodos } from "@/actions/todo";
import { STATUS } from "@/enums/status.enum";
import { PRIORITY } from "@/enums/priority.enum";
import { PaginationMeta } from "@/interfaces/pagination.interface";

export function useTodos() {
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const [status, setStatus] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    items_per_page: 20
  });

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleItemsPerPageChange = useCallback((limit: number) => {
    setPagination({ page: 1, limit });
  }, []);

  const fetchTodos = useCallback(async (options?: { append?: boolean, page?: number }) => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      setIsLoading(true);
      const response = await paginateTodos({
        page: options?.page ?? pagination.page,
        limit: pagination.limit,
        title: debouncedSearch || undefined,
        priority: priority === "all" ? undefined : priority as PRIORITY,
        status: status === "all" ? undefined : status as STATUS,
      });

      setTodos((prev) => options?.append ? [...prev, ...response.results] : response.results);
      setPaginationMeta(response.meta);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, pagination.limit, pagination.page, priority, status]);

  const resetPaginationAndRefetch = useCallback(() => {
    setPagination((prev) => {
      if (prev.page === 1) {
        // If already on page 1, fetch manually
        setTimeout(() => fetchTodos({ append: false, page: 1 }), 0);
        return prev;
      }
      return { ...prev, page: 1 };
    });
  }, [fetchTodos]);

  const pendingAppendRef = useRef(false);
  const prevFiltersRef = useRef({ debouncedSearch, priority, status });

  useEffect(() => {
    let currentPage = pagination.page;
    
    // Check if filters changed
    if (
      prevFiltersRef.current.debouncedSearch !== debouncedSearch ||
      prevFiltersRef.current.priority !== priority ||
      prevFiltersRef.current.status !== status
    ) {
      currentPage = 1;
      setPagination((prev) => ({ ...prev, page: 1 }));
      prevFiltersRef.current = { debouncedSearch, priority, status };
    }

    fetchTodos({ append: pendingAppendRef.current, page: currentPage });
    pendingAppendRef.current = false;
  }, [fetchTodos, debouncedSearch, priority, status, pagination.page]);

  const loadMore = useCallback(() => {
    if (isLoading || isFetchingRef.current) return;
    if (pagination.page < paginationMeta.total_pages) {
      pendingAppendRef.current = true;
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [isLoading, pagination.page, paginationMeta.total_pages]);

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

  // Optimistic Handlers
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
      if (prevTodos.some((todo) => todo.id === todoToRestore.id)) return prevTodos;
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

  return {
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
    resetPaginationAndRefetch
  };
}
