import uuid
from sqlalchemy import case
from sqlmodel import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.todo import Priority, Todo, TodoStatus
from app.schemas.todo import TodoFilterParams, TodoUpdate


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
                query = query.where(func.lower(Todo.title).contains(filters.title.lower()))
        return query.order_by(Todo.created_at.desc())

    async def get_todos_by_owner_query(self, owner_id: uuid.UUID):
        return select(Todo).where(Todo.owner_id == owner_id).order_by(Todo.created_at.desc())

    async def update_todo(self, todo: Todo, todo_in: TodoUpdate) -> Todo:
        update_data = todo_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(todo, key, value)

        self.session.add(todo)
        await self.session.commit()
        await self.session.refresh(todo)
        return todo

    async def delete_todo(self, todo: Todo) -> None:
        await self.session.delete(todo)
        await self.session.commit()

    async def get_user_todo_stats(self, owner_id: uuid.UUID) -> tuple[int, int, int, dict[Priority, int]]:
        summary_query = select(
            func.count(Todo.id),
            func.sum(case((Todo.status == TodoStatus.COMPLETED, 1), else_=0)),
        ).where(Todo.owner_id == owner_id)
        summary_result = await self.session.execute(summary_query)
        total, completed = summary_result.one()

        priority_query = (
            select(Todo.priority, func.count(Todo.id))
            .where(Todo.owner_id == owner_id)
            .where(Todo.priority.is_not(None))
            .group_by(Todo.priority)
        )
        priority_result = await self.session.execute(priority_query)
        by_priority = {priority: count for priority, count in priority_result.all()}

        return int(total or 0), int(completed or 0), int((total or 0) - (completed or 0)), by_priority

