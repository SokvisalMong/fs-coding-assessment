from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.dependencies.user import UserServiceDep
from app.schemas.auth import AuthToken
from app.schemas.response import ApiResponse
from app.schemas.user import UserLogin, UserRead, UserRegister
from app.utils.response import success_response


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=ApiResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
)
async def register(user_in: UserRegister, user_service: UserServiceDep):
    """
    Register a new user account.
    
    Validates username and email availability. Hash the password before storage.
    """
    user = await user_service.register_user(user_in)
    return success_response(user, code=status.HTTP_201_CREATED, message="created")


@router.post("/login", response_model=ApiResponse[AuthToken])
async def login(user_in: UserLogin, user_service: UserServiceDep):
    """
    Authenticate user and return access token.
    
    Accepts JSON credentials (username/password).
    """
    token = await user_service.authenticate_user(user_in)
    return success_response(token)


@router.post("/oauth2", response_model=ApiResponse[AuthToken])
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_service: UserServiceDep,
) -> ApiResponse[AuthToken]:
    """
    OAuth2 compatible token login.
    
    Accepts form-data credentials for compatibility with Swagger UI 'Authorize' button.
    """
    user_in = UserLogin(username=form_data.username, password=form_data.password)
    token = await user_service.authenticate_user(user_in)
    return success_response(token)
