from pydantic import BaseModel, Field, field_validator

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    limit: int = Field(default=20, ge=1, description="Items per page")

    @field_validator("limit")
    @classmethod
    def cap_limit(cls, v: int) -> int:
        return min(v, 100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit
