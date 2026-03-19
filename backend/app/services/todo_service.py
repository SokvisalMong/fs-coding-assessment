import uuid
from fastapi import HTTPException, status

from app.models.todo import Priority, Todo, TodoStatus
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoFilterParams, TodoPriorityStats, TodoStats, TodoUpdate
from app.schemas.pagination import PaginationParams
from app.utils.pagination import paginate_query
from app.schemas.response import PaginatedData


class TodoService:
    def __init__(self, todo_repository: TodoRepository):
        self.todo_repository = todo_repository

    async def create_todo(self, todo_in: TodoCreate, owner_id: uuid.UUID) -> Todo:
        todo = Todo(**todo_in.model_dump(), owner_id=owner_id)
        return await self.todo_repository.create_todo(todo)

    async def get_todo_by_id(self, todo_id: uuid.UUID, current_user_id: uuid.UUID) -> Todo:
        todo = await self.todo_repository.get_todo_by_id(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )
        if todo.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this todo",
            )
        return todo

    async def get_all_todos(
        self, 
        current_user_id: uuid.UUID, 
        params: PaginationParams,
        filters: TodoFilterParams | None = None
    ) -> PaginatedData:
        query = await self.todo_repository.get_all_todos_query(filters)
        paginated_data = await paginate_query(self.todo_repository.session, query, params)
        
        # Hide description for todos not owned by the current user
        for todo in paginated_data.results:
            if todo.owner_id != current_user_id:
                todo.description = None
        
        return paginated_data

    async def get_user_todos(self, owner_id: uuid.UUID, params: PaginationParams) -> PaginatedData:
        query = await self.todo_repository.get_todos_by_owner_query(owner_id)
        return await paginate_query(self.todo_repository.session, query, params)

    async def update_todo(
        self,
        todo_id: uuid.UUID,
        todo_in: TodoUpdate,
        current_user_id: uuid.UUID,
    ) -> Todo:
        todo = await self.todo_repository.get_todo_by_id(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )
        if todo.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this todo",
            )
        return await self.todo_repository.update_todo(todo, todo_in)

    async def complete_todo(self, todo_id: uuid.UUID, current_user_id: uuid.UUID) -> Todo:
        todo = await self.todo_repository.get_todo_by_id(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )
        if todo.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to complete this todo",
            )
        
        if todo.status == TodoStatus.NOT_STARTED:
            new_status = TodoStatus.IN_PROGRESS
        elif todo.status == TodoStatus.IN_PROGRESS:
            new_status = TodoStatus.COMPLETED
        else:
            new_status = TodoStatus.NOT_STARTED

        return await self.todo_repository.update_todo(
            todo,
            TodoUpdate(status=new_status),
        )

    async def delete_todo(self, todo_id: uuid.UUID, current_user_id: uuid.UUID) -> None:
        todo = await self.todo_repository.get_todo_by_id(todo_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found",
            )
        if todo.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this todo",
            )
        await self.todo_repository.delete_todo(todo)

    async def get_todo_stats(self, owner_id: uuid.UUID) -> TodoStats:
        total, completed, pending, priority_counts = await self.todo_repository.get_user_todo_stats(owner_id)

        return TodoStats(
            total=total,
            completed=completed,
            pending=pending,
            by_priority=TodoPriorityStats(
                LOW=priority_counts.get(Priority.LOW, 0),
                MEDIUM=priority_counts.get(Priority.MEDIUM, 0),
                HIGH=priority_counts.get(Priority.HIGH, 0),
            ),
        )

