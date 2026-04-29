from __future__ import annotations

from pydantic import BaseModel, Field


class SourceHit(BaseModel):
    source: str
    section: str | None = None
    kind: str | None = None
    score: float = 0.0
    text: str


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class ResponseData(BaseModel):
    text: str
    audio: str | None = None


class StandardResponse(BaseModel):
    status: str = "success"
    data: ResponseData
