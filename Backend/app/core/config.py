from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None


if load_dotenv:
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _parse_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(slots=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "VOTEWISE AI")
    app_env: str = os.getenv("APP_ENV", "development")
    allowed_origins: list[str] = field(
        default_factory=lambda: _parse_csv(
            os.getenv("ALLOWED_ORIGINS"),
            ["http://localhost:3000", "http://localhost:5173"],
        )
    )

    data_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parents[1] / "data")

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_base_url: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1/chat/completions")

    request_timeout_seconds: float = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "20"))
    max_context_chunks: int = int(os.getenv("MAX_CONTEXT_CHUNKS", "4"))


settings = Settings()
