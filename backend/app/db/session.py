from typing import AsyncGenerator

from sqlalchemy.orm import sessionmaker
from sqlmodel import create_engine
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import get_settings
import app.models  # noqa: F401


settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=settings.DATABASE_POOL_SIZE,  # Max number of permanent connections
    max_overflow=settings.DATABASE_MAX_OVERFLOW,  # Max number of connections above pool_size
    pool_timeout=settings.DATABASE_POOL_TIMEOUT,  # Seconds to wait for connection from pool
    pool_recycle=settings.DATABASE_POOL_RECYCLE,  # Recycle connections after 1 hour (prevents stale connections)
)


# Dependency to get async session
async def get_async_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session
