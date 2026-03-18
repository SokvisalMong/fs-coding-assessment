import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.schemas.mixin import TimeStampMixin

if TYPE_CHECKING:
    from app.models.user import User

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TodoStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class TodoBase(SQLModel):
    title: str = Field(max_length=200, nullable=False)
    description: str = Field(nullable=False)
    status: TodoStatus = Field(default=TodoStatus.NOT_STARTED, nullable=False)
    priority: Priority | None = Field(default=None, nullable=True)
    due_date: datetime | None = Field(
        default=None,
        nullable=True,
        sa_type=DateTime(timezone=True),
    )


class Todo(TodoBase, TimeStampMixin, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True, nullable=False
    )
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    owner: "User" = Relationship(back_populates="todos")
