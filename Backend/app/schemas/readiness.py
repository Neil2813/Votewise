from __future__ import annotations

from pydantic import BaseModel, Field


class ReadinessRequest(BaseModel):
    registration_done: bool = False
    documents_ready: bool = False
    guide_completed: bool = False
    simulation_done: bool = False
    polling_location_verified: bool = False
    understand_rights: bool = False


class ReadinessResponse(BaseModel):
    score: int
    label: str
    breakdown: dict[str, bool]
    missing: list[str]
