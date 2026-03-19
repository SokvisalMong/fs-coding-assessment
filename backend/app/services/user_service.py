import uuid
from datetime import timedelta

from fastapi import status

from app.core import security
from app.core.config import get_settings
from app.models.user import UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthToken
from app.schemas.user import UserCreate, UserLogin, UserRead, UserRegister, UserUpdate
from app.exceptions.base import BadRequestException, UnauthorizedException, NotFoundException


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        self.settings = get_settings()

    async def register_user(self, user_in: UserRegister) -> UserRead:
        if await self.user_repository.get_user_by_username(user_in.username):
            raise BadRequestException(message="Username already registered")
        if user_in.email and await self.user_repository.get_user_by_email(user_in.email):
            raise BadRequestException(message="Email already registered")

        user_create = UserCreate(
            username=user_in.username,
            email=user_in.email,
            hashed_password=security.get_password_hash(user_in.password),
        )

        return await self.user_repository.register_user(user_create)

    async def _authenticate(self, username: str, password: str):
        user = await self.user_repository.get_user_by_username(username)
        if not user:
            return None
        if not security.verify_password(password, user.hashed_password):
            return None
        return user

    async def authenticate_user(self, user_in: UserLogin) -> AuthToken:
        user = await self._authenticate(
            username=user_in.username, password=user_in.password
        )
        if not user:
            raise UnauthorizedException(message="Invalid username or password")

        elif not user.status == UserStatus.ACTIVE:
            raise BadRequestException(message=f"{user.status.value.capitalize()} user")

        access_token_expires = timedelta(
            minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        return AuthToken(
            access_token=security.create_access_token(
                subject=user.id, expires_delta=access_token_expires
            ),
            expires_in=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            token_type="bearer",
        )

    async def get_user(self, user_id: uuid.UUID) -> UserRead:
        user = await self.user_repository.get_user(user_id)
        if not user:
            raise NotFoundException(message="User not found")
        return user

    async def get_users(
        self, page: int = 1, items_per_page: int = 10
    ) -> tuple[list[UserRead], int]:
        skip = (page - 1) * items_per_page
        return await self.user_repository.get_users(skip=skip, limit=items_per_page)

    async def update_user(self, user_id: uuid.UUID, user_in: UserUpdate) -> UserRead:
        user = await self.user_repository.update_user(user_id, user_in)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user
