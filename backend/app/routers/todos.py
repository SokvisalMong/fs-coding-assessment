import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.todo import TodoServiceDep
from app.models.user import User
from app.schemas.response import ApiResponse, PaginatedData
from app.schemas.todo import TodoCreate, TodoFilterParams, TodoRead, TodoStats, TodoUpdate
from app.schemas.pagination import PaginationParams
from app.utils.response import success_response


router = APIRouter(prefix="/todos", tags=["todos"])


@router.post("", response_model=ApiResponse[TodoRead], status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_in: TodoCreate,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Create a new todo.
    
    The todo will be automatically assigned to the currently authenticated user.
    """
    todo = await todo_service.create_todo(todo_in, current_user.id)
    return success_response(todo, code=status.HTTP_201_CREATED, message="created")



@router.get("", response_model=ApiResponse[PaginatedData[TodoRead]])
async def get_todos(
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
    pagination: Annotated[PaginationParams, Depends()],
    filters: Annotated[TodoFilterParams, Depends()],
):
    """
    Retrieve a paginated list of todos.
    
    - **All authenticated users** can view todos.
    - **Description field** is hidden if the todo does not belong to the current user.
    - Support for pagination, filtering by priority/status, and searching by title.
    """
    # All authenticated users can view todos, but without description for non-owners
    paginated_results = await todo_service.get_all_todos(current_user.id, pagination, filters)
    return success_response(paginated_results)


@router.get("/stats", response_model=ApiResponse[TodoStats])
async def get_stats(
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get todo statistics for the current user.
    
    Includes total count, completed vs pending, and breakdown by priority.
    """
    stats = await todo_service.get_todo_stats(current_user.id)
    return success_response(stats)


@router.get("/{todo_id}", response_model=ApiResponse[TodoRead])
async def get_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get a single todo by ID.
    
    Only the owner of the todo can access its full details.
    """
    todo = await todo_service.get_todo_by_id(todo_id, current_user.id)
    return success_response(todo)


@router.patch("/{todo_id}", response_model=ApiResponse[TodoRead])
async def update_todo(
    todo_id: uuid.UUID,
    todo_in: TodoUpdate,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Update an existing todo.
    
    Only the owner of the todo can update its fields. Supports partial updates.
    """
    todo = await todo_service.update_todo(todo_id, todo_in, current_user.id)
    return success_response(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Delete a todo.
    
    Only the owner of the todo can perform this action.
    """
    await todo_service.delete_todo(todo_id, current_user.id)
    return None


@router.patch("/{todo_id}/complete", response_model=ApiResponse[TodoRead])
async def complete_todo(
    todo_id: uuid.UUID,
    todo_service: TodoServiceDep,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Toggle the completion status of a todo.
    
    Cycle through statuses (NOT_STARTED -> IN_PROGRESS -> COMPLETED).
    """
    todo = await todo_service.complete_todo(todo_id, current_user.id)
    return success_response(todo)
