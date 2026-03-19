FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies into system Python
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Run database migrations and start the server
# In a real production setup, you might separate migrations from app startup
CMD uv run alembic upgrade head && uv run fastapi run app/main.py --host 0.0.0.0 --port 8000