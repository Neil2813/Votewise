from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging
from app.routers.health import router as health_router
from app.routers.chat import router as chat_router
from app.routers.guide import router as guide_router
from app.routers.compare import router as compare_router
from app.routers.misinformation import router as misinformation_router
from app.routers.readiness import router as readiness_router
from app.routers.simulate import router as simulate_router

configure_logging()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="India-only, stateless election education backend for VOTEWISE AI.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins if settings.allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(guide_router)
app.include_router(compare_router)
app.include_router(misinformation_router)
app.include_router(readiness_router)
app.include_router(simulate_router)


@app.get("/")
async def root() -> dict:
    return {
        "app": settings.app_name,
        "status": "running",
        "country_scope": "India-only",
        "stateless": True,
    }
