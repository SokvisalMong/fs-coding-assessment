"""Main FastAPI application module."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import auth, todos, users
from app.utils.response import error_response, success_response
from app.exceptions.base import AppException


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    yield
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Todo management API with authentication",
    version="1.0.0",
    lifespan=lifespan,
    openapi_url="/openapi.json",
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application exceptions and return standardized error response."""
    return error_response(
        message=exc.message,
        status_code=exc.status_code,
        details=exc.details,
    )


# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(todos.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")


@app.get("/")
async def root():
    return success_response(
        {"message": "Todo API is running!", "version": "1.0.0", "docs": "/docs"}
    )


@app.get("/health")
async def health():
    return success_response({"status": "ok"})


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, exc: HTTPException
):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.status_code, str(exc.detail)).model_dump(),
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    first_error = exc.errors()[0].get("msg", "Validation error") if exc.errors() else "Validation error"
    return JSONResponse(
        status_code=422,
        content=error_response(422, first_error).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
):
    return JSONResponse(
        status_code=500,
        content=error_response(500, "Internal server error").model_dump(),
    )
