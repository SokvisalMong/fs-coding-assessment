import uuid
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError

from app.core.config import get_settings
from app.dependencies.user import UserServiceDep
from app.models.user import User, UserStatus
from app.schemas.auth import TokenPayload


http_bearer = HTTPBearer()

settings = get_settings()


TokenDep = Annotated[HTTPAuthorizationCredentials, Depends(http_bearer)]


async def get_current_user(token: TokenDep, user_service: UserServiceDep) -> User:
    try:
        payload = jwt.decode(
            token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = await user_service.get_user(uuid.UUID(token_data.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not user.status == UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{user.status.value.capitalize()} user",
        )
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
