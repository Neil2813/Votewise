from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Literal


class SimulateRequest(BaseModel):
    step: Literal["identity", "selection", "confirmation", "custom"]
    payload: dict = Field(default_factory=dict)


class SimulateResponse(BaseModel):
    ok: bool
    message: str
    validated_locally: bool = True
