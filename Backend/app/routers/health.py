from __future__ import annotations

from fastapi import APIRouter
from app.services.retrieval import kb

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {
        "ok": True,
        "app": "VOTEWISE AI",
        "sources_loaded": kb.sources(),
        "mode": "stateless",
        "country_scope": "India-only",
    }


@router.get("/sources")
async def sources() -> dict:
    return {"sources": kb.sources()}
