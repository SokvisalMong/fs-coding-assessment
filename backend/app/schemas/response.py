from math import ceil
from typing import Generic, TypeVar

from pydantic import BaseModel


TData = TypeVar("TData")
TResult = TypeVar("TResult")


class ApiResponse(BaseModel, Generic[TData]):
    code: int
    message: str
    data: TData | None = None


class PaginationMeta(BaseModel):
    items_per_page: int
    current_page: int
    total_count: int
    total_pages: int


class PaginatedData(BaseModel, Generic[TResult]):
    meta: PaginationMeta
    results: list[TResult]


def success_response(
    data: TData | None = None,
    *,
    code: int = 200,
    message: str = "ok",
) -> ApiResponse[TData]:
    return ApiResponse[TData](code=code, message=message, data=data)


def paginated_response(
    results: list[TResult],
    *,
    total_count: int,
    current_page: int,
    items_per_page: int,
    code: int = 200,
    message: str = "ok",
) -> ApiResponse[PaginatedData[TResult]]:
    total_pages = ceil(total_count / items_per_page) if total_count > 0 else 0

    return ApiResponse[PaginatedData[TResult]](
        code=code,
        message=message,
        data=PaginatedData[TResult](
            meta=PaginationMeta(
                items_per_page=items_per_page,
                current_page=current_page,
                total_count=total_count,
                total_pages=total_pages,
            ),
            results=results,
        ),
    )


def error_response(code: int, message: str) -> ApiResponse[None]:
    return ApiResponse[None](code=code, message=message, data=None)