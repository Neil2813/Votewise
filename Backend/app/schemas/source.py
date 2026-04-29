from __future__ import annotations

from pydantic import BaseModel, Field


class SourceInventoryResponse(BaseModel):
    sources: list[str]
