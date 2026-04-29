from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal
from .common import SourceHit


Verdict = Literal["True", "False", "Unverified"]


class MisinformationRequest(BaseModel):
    claim: str = Field(..., min_length=1)


class MisinformationResponse(BaseModel):
    verdict: Verdict
    explanation: str
    matched_rule: str | None = None
    sources: list[SourceHit] = Field(default_factory=list)
    mode: str
