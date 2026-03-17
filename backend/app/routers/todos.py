from fastapi import APIRouter

from app.schemas.response import ApiResponse
from app.utils.response import success_response


router = APIRouter(prefix="/todos", tags=["todos"])


@router.post("")
async def create_todo():
    # TODO: Implement create todo endpoint
    return success_response("todo")


@router.get("")
async def get_todos():
    # TODO: Implement list todos endpoint
    # All authenticated users can view todos, but without description
    return success_response("todos")


@router.get("/{todo_id}")
async def get_todo():
    # TODO: Implement get todo endpoint
    return success_response("todo")


@router.patch("/{todo_id}")
async def update_todo():
    return success_response("todo")


@router.delete("/{todo_id}", response_model=ApiResponse[None])
async def delete_todo():
    # TODO: Implement delete todo endpoint
    return success_response(None)


@router.patch("/{todo_id}/complete")
async def complete_todo():
    # TODO: Implement complete todo endpoint
    return success_response("todo")


@router.get("/stats")
async def get_stats():
    # TODO: Implement get stats endpoint
    return success_response("stats")
