from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal
from .common import SourceHit


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    mode: str
    verified: bool = False
    sources: list[SourceHit] = Field(default_factory=list)
