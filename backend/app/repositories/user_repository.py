import uuid

from pydantic import EmailStr
from sqlalchemy import func
from sqlmodel import Session, select

from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    async def get_user(self, user_id: uuid.UUID) -> User | None:
        user = await self.session.get(User, user_id)
        return user

    async def get_user_by_email(self, email: EmailStr) -> User | None:
        statement = select(User).where(User.email == email)
        result = await self.session.exec(statement)
        return result.first()

    async def get_user_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        result = await self.session.exec(statement)
        return result.first()

    async def get_users(self, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        statement = select(User).offset(skip).limit(limit)
        result = await self.session.exec(statement)
        users = result.all()

        count_statement = select(func.count()).select_from(User)
        total_count_result = await self.session.exec(count_statement)
        total_count = total_count_result.one()

        return users, total_count

    async def register_user(self, user_in: UserCreate) -> User:
        user = User(**user_in.model_dump())
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_user(self, user_id: uuid.UUID, user_in: UserCreate) -> User | None:
        user = await self.get_user(user_id)
        if not user:
            return None
        user_data = user_in.model_dump(exclude_unset=True)
        for key, value in user_data.items():
            setattr(user, key, value)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
