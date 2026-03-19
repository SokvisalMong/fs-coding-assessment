from typing import Any, Dict, Optional
from fastapi import status


class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundException(AppException):
    """Exception raised when a resource is not found."""

    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND, details=details)


class ForbiddenException(AppException):
    """Exception raised when a user is not authorized to perform an action."""

    def __init__(self, message: str = "Action forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN, details=details)


class BadRequestException(AppException):
    """Exception raised for invalid input or bad requests."""

    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST, details=details)


class UnauthorizedException(AppException):
    """Exception raised when authentication fails."""

    def __init__(self, message: str = "Unauthorized", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED, details=details)
