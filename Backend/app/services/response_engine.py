from __future__ import annotations

import uuid
from pathlib import Path

from app.services.llm.orchestrator import llm_orchestrator


MASTER_SYSTEM_PROMPT = """You are an election education assistant for India.

Instructions:
- Use only India-specific election knowledge.
- Keep answers simple and structured.
- Avoid political bias.
- If explaining rules, simplify them.
- If explaining myths, clearly label truth vs false.

Format:
- Short paragraphs
- Bullet points if needed
"""

SUPPORTED_LANGUAGES = {"en", "hi", "ta", "te", "kn", "ml"}
AUDIO_DIR = Path(__file__).resolve().parents[1] / "generated_audio"


async def generate_with_fallback(prompt: str, system: str = MASTER_SYSTEM_PROMPT) -> tuple[str, str]:
    return await llm_orchestrator.generate(system, prompt)


async def format_with_llm(text: str, instruction: str | None = None) -> str:
    prompt = f"""
Convert the following into a clean, user-friendly explanation.

Rules:
- Simple language
- Bullet points if needed
- India-specific context only
- No technical jargon
{f"- {instruction}" if instruction else ""}

TEXT:
{text}
"""
    formatted, provider = await generate_with_fallback(prompt)
    if provider == "local-failure" or not formatted.strip():
        return text
    return formatted.strip()


def translate_text(text: str, target_lang: str) -> str:
    lang = _normalize_lang(target_lang)
    if lang == "en":
        return text

    try:
        from translate import Translator

        translator = Translator(to_lang=lang)
        translated = translator.translate(text)
        return translated or text
    except Exception:
        return text


def text_to_speech(text: str, lang: str = "en") -> str | None:
    try:
        import pyttsx3

        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        engine = pyttsx3.init()

        voices = engine.getProperty("voices")
        normalized_lang = _normalize_lang(lang)
        for voice in voices:
            voice_id = getattr(voice, "id", "").lower()
            voice_name = getattr(voice, "name", "").lower()
            if normalized_lang in voice_id or normalized_lang in voice_name:
                engine.setProperty("voice", voice.id)
                break

        filename = f"audio_{uuid.uuid4().hex}.mp3"
        output_path = AUDIO_DIR / filename
        engine.save_to_file(text, str(output_path))
        engine.runAndWait()

        return f"/audio/{filename}"
    except Exception:
        return None


async def process_response(
    user_query: str,
    rag_context: str,
    lang: str = "en",
    use_voice: bool = False,
    *,
    system: str = MASTER_SYSTEM_PROMPT,
    prompt: str | None = None,
    fallback_text: str | None = None,
    format_instruction: str | None = None,
) -> dict[str, str | None]:
    generation_prompt = prompt or f"""User query:
{user_query}

Retrieved knowledge:
{rag_context}
"""

    response, provider = await generate_with_fallback(generation_prompt, system)
    if provider == "local-failure" or not response.strip():
        response = fallback_text or "I could not generate a complete answer from the available India-only knowledge."

    formatted = await format_with_llm(response, instruction=format_instruction)
    translated = translate_text(formatted, lang)

    audio_file = None
    if use_voice:
        audio_file = text_to_speech(translated, lang)

    return {
        "text": translated,
        "audio": audio_file,
    }


def _normalize_lang(lang: str | None) -> str:
    normalized = (lang or "en").strip().lower()
    return normalized if normalized in SUPPORTED_LANGUAGES else "en"
