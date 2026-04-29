from __future__ import annotations

import httpx
from app.core.config import settings
from app.services.llm.base import LLMResult


class GroqClient:
    def __init__(self) -> None:
        self.api_key = settings.groq_api_key
        self.model = settings.groq_model
        self.base_url = settings.groq_base_url
        self.timeout = settings.request_timeout_seconds

    async def generate(self, system: str, prompt: str) -> LLMResult | None:
        if not self.api_key:
            return None

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(self.base_url, json=payload, headers=headers)
                if resp.status_code >= 400:
                    return None
                data = resp.json()
                choices = data.get("choices") or []
                if not choices:
                    return None
                text = (choices[0].get("message") or {}).get("content", "").strip()
                if not text:
                    return None
                return LLMResult(text=text, provider="groq", raw=data)
        except Exception:
            return None
