from __future__ import annotations

from pydantic import BaseModel, Field
from .common import SourceHit


class CompareRequest(BaseModel):
    left: str = Field(..., min_length=1)
    right: str = Field(..., min_length=1)
    context: str | None = None
    lang: str = "en"
    voice: bool = False


class CompareResponse(BaseModel):
    summary: str
    mode: str
    sources: list[SourceHit] = Field(default_factory=list)
