from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(slots=True)
class LLMResult:
    text: str
    provider: str
    raw: dict | None = None


class LLMClient(Protocol):
    async def generate(self, system: str, prompt: str) -> LLMResult | None: ...
