import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.todo import TodoServiceDep
from app.models.user import User
from app.schemas.response import ApiResponse, PaginatedData
from app.schemas.todo import TodoCreate, TodoRead, TodoFilterParams
from app.schemas.pagination import PaginationParams
from app.utils.response import success_response, paginated_response


router = APIRouter(prefix="/todos", tags=["todos"])


@router.post("", response_model=ApiResponse[TodoRead], status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_in: TodoCreate,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    todo = await todo_service.create_todo(todo_in, current_user.id)
    return success_response(todo, code=status.HTTP_201_CREATED, message="created")



@router.get("", response_model=ApiResponse[PaginatedData[TodoRead]])
async def get_todos(
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    filters: Annotated[TodoFilterParams, Depends()],
):
    # All authenticated users can view todos, but without description for non-owners
    paginated_results = await todo_service.get_all_todos(current_user.id, pagination, filters)
    return success_response(paginated_results)


@router.get("/{todo_id}", response_model=ApiResponse[TodoRead])
async def get_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    todo = await todo_service.get_todo_by_id(todo_id, current_user.id)
    return success_response(todo)


@router.patch("/{todo_id}")
async def update_todo():
    return success_response("todo")


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    await todo_service.delete_todo(todo_id, current_user.id)
    return None


@router.patch("/{todo_id}/complete")
async def complete_todo():
    # TODO: Implement complete todo endpoint
    return success_response("todo")


@router.get("/stats")
async def get_stats():
    # TODO: Implement get stats endpoint
    return success_response("stats")
