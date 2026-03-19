from math import ceil
from typing import TypeVar, Generic, Sequence
from sqlmodel import select, func, SQLModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.response import ApiResponse, PaginatedData, PaginationMeta
from app.schemas.pagination import PaginationParams

T = TypeVar("T", bound=SQLModel)

async def paginate_query(
    session: AsyncSession,
    query, # SQLModel select statement
    params: PaginationParams,
) -> PaginatedData:
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await session.exec(count_query)
    total_count = count_result.one()

    # Apply limit and offset
    paginated_query = query.offset(params.offset).limit(params.limit)
    result = await session.exec(paginated_query)
    results = result.all()

    total_pages = ceil(total_count / params.limit) if total_count > 0 else 0

    return PaginatedData(
        meta=PaginationMeta(
            items_per_page=params.limit,
            current_page=params.page,
            total_count=total_count,
            total_pages=total_pages
        ),
        results=results
    )
