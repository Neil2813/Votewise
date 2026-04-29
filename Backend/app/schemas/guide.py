from __future__ import annotations

from pydantic import BaseModel, Field
from .common import SourceHit


class GuideRequest(BaseModel):
    topic: str = Field(default="India election process", min_length=1)
    audience: str | None = None


class GuideResponse(BaseModel):
    guide: str
    mode: str
    sources: list[SourceHit] = Field(default_factory=list)
