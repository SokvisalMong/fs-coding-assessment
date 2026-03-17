import uuid

from fastapi import APIRouter, Query

from app.dependencies.auth import CurrentUserDep
from app.dependencies.user import UserServiceDep
from app.schemas.response import ApiResponse, PaginatedData
from app.schemas.user import UserRead, UserUpdate
from app.utils.response import paginated_response, success_response


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=ApiResponse[PaginatedData[UserRead]])
async def get_users(
    user_service: UserServiceDep,
    current_user: CurrentUserDep,
    page: int = Query(default=1, ge=1),
    items_per_page: int = Query(default=10, ge=1, le=100),
):
    users, total_count = await user_service.get_users(
        page=page, items_per_page=items_per_page
    )
    return paginated_response(
        users,
        total_count=total_count,
        current_page=page,
        items_per_page=items_per_page,
    )


@router.get("/me", response_model=ApiResponse[UserRead])
def get_me(current_user: CurrentUserDep):
    return success_response(current_user)


@router.get("/{user_id}", response_model=ApiResponse[UserRead])
async def get_user(
    user_id: uuid.UUID, user_service: UserServiceDep, current_user: CurrentUserDep
):
    user = await user_service.get_user(user_id)
    return success_response(user)


@router.patch("/{user_id}", response_model=ApiResponse[UserRead])
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    user_service: UserServiceDep,
    current_user: CurrentUserDep,
):
    user = await user_service.update_user(user_id, user_in)
    return success_response(user)
