import uuid
from datetime import datetime

from sqlmodel import SQLModel

from app.models.todo import TodoBase, Priority, TodoStatus
from app.schemas.mixin import TimeStampMixin


class TodoCreate(SQLModel):
    title: str
    description: str
    priority: Priority | None = None
    due_date: datetime | None = None


class TodoRead(TodoBase, TimeStampMixin):
    id: uuid.UUID
    owner_id: uuid.UUID


class TodoUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    status: TodoStatus | None = None
    priority: Priority | None = None
    due_date: datetime | None = None


class TodoFilterParams(SQLModel):
    title: str | None = None
    status: TodoStatus | None = None
    priority: Priority | None = None

