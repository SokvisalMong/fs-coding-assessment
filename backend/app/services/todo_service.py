import uuid
from fastapi import HTTPException, status

from app.models.todo import Todo, Priority
from app.repositories.todo_repository import TodoRepository
from app.schemas.todo import TodoCreate, TodoFilterParams
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

