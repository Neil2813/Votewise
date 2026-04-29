from __future__ import annotations

import httpx
from app.core.config import settings
from app.services.llm.base import LLMResult


class GeminiClient:
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.timeout = settings.request_timeout_seconds

    async def generate(self, system: str, prompt: str) -> LLMResult | None:
        if not self.api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{system}\n\n{prompt}"}],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code >= 400:
                    return None
                data = resp.json()
                candidates = data.get("candidates") or []
                if not candidates:
                    return None
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                text = "".join(part.get("text", "") for part in parts).strip()
                if not text:
                    return None
                return LLMResult(text=text, provider="gemini", raw=data)
        except Exception:
            return None
