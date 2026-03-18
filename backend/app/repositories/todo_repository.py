import uuid
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.todo import Todo
from app.schemas.todo import TodoFilterParams


class TodoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_todo(self, todo: Todo) -> Todo:
        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def get_todo_by_id(self, todo_id: uuid.UUID) -> Todo | None:
        return await self.session.get(Todo, todo_id)

    async def get_all_todos_query(self, filters: TodoFilterParams | None = None):
        query = select(Todo)
        if filters:
            if filters.status:
                query = query.where(Todo.status == filters.status)
            if filters.priority:
                query = query.where(Todo.priority == filters.priority)
            if filters.title:
                query = query.where(Todo.title.contains(filters.title))
        return query

    async def get_todos_by_owner_query(self, owner_id: uuid.UUID):
        return select(Todo).where(Todo.owner_id == owner_id)

