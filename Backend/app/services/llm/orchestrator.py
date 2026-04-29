from __future__ import annotations

from app.services.llm.gemini import GeminiClient
from app.services.llm.groq import GroqClient
from app.core.policy import safe_block_message


class LLMOrchestrator:
    def __init__(self) -> None:
        self.gemini = GeminiClient()
        self.groq = GroqClient()

    async def generate(self, system: str, prompt: str) -> tuple[str, str]:
        result = await self.gemini.generate(system, prompt)
        if result and result.text.strip():
            return result.text.strip(), result.provider

        result = await self.gemini.generate(system, prompt)
        if result and result.text.strip():
            return result.text.strip(), result.provider

        result = await self.groq.generate(system, prompt)
        if result and result.text.strip():
            return result.text.strip(), result.provider

        return safe_block_message(), "local-failure"


llm_orchestrator = LLMOrchestrator()
