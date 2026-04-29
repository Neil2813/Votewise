from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.simulate import SimulateRequest, SimulateResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message

router = APIRouter(tags=["simulate"])


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(payload: SimulateRequest) -> SimulateResponse:
    raw = f"{payload.step} {payload.payload}".lower()
    if detect_non_india_request(raw) or is_blocked_politically(raw):
        raise HTTPException(status_code=400, detail=safe_block_message())

    if payload.step == "identity":
        full_name = str(payload.payload.get("full_name", "")).strip()
        voter_id = str(payload.payload.get("voter_id", "")).strip()
        ok = bool(full_name) and bool(voter_id)
        return SimulateResponse(
            ok=ok,
            message="Identity step validated locally." if ok else "Enter a name and voter ID to continue.",
        )

    if payload.step == "selection":
        choice = str(payload.payload.get("candidate", "")).strip()
        ok = bool(choice)
        return SimulateResponse(
            ok=ok,
            message="Candidate selection validated locally." if ok else "Select a candidate to continue.",
        )

    if payload.step == "confirmation":
        confirmed = bool(payload.payload.get("confirmed", False))
        return SimulateResponse(
            ok=confirmed,
            message="Confirmation validated locally." if confirmed else "Confirm the selection to finish.",
        )

    return SimulateResponse(
        ok=True,
        message="Custom simulation accepted for frontend-first validation.",
    )
