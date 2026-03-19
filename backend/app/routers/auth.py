from fastapi import APIRouter, status

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
