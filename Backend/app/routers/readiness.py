from __future__ import annotations

from fastapi import APIRouter
from app.schemas.readiness import ReadinessRequest, ReadinessResponse
from app.services.rules import compute_readiness

router = APIRouter(tags=["readiness"])


@router.post("/readiness-score", response_model=ReadinessResponse)
async def readiness_score(payload: ReadinessRequest) -> ReadinessResponse:
    score, label, breakdown, missing = compute_readiness(payload.model_dump())
    return ReadinessResponse(score=score, label=label, breakdown=breakdown, missing=missing)
