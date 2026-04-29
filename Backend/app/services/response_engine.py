from __future__ import annotations

import uuid
import re
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
- Plain text only; do not use Markdown headings, bold markers, tables, or citation markers
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
- Do not include citations, indexes, contentReference markers, source placeholders, or raw database labels
- Plain text only. Do not use Markdown syntax such as **bold**, # headings, tables, or citation markers
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
    if _normalize_lang(lang) != "en":
        return None

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

    response = clean_user_text(response)
    formatted = await format_with_llm(response, instruction=format_instruction)
    formatted = clean_user_text(formatted)
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


def clean_source_text(text: str) -> str:
    text = _strip_artifacts(text)
    clean_lines: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        lower = line.lower()
        if not line:
            continue
        if lower.startswith("source: placeholder"):
            continue
        if lower.startswith("source:"):
            continue
        if lower.startswith("title:"):
            line = line.split(":", 1)[1].strip()
        source_index = line.lower().find(" source:")
        if source_index != -1:
            line = line[:source_index].strip()
        clean_lines.append(line)
    return _strip_artifacts(" ".join(clean_lines)).strip()


def clean_user_text(text: str) -> str:
    text = _strip_artifacts(text)
    text = text.replace("Verified source-based summary:", "Here is a simple answer:")
    text = text.replace(
        "If the stored text is partial, the answer should be treated as a summary, not a legal opinion.",
        "This is a simple educational summary, not legal advice.",
    )

    lines: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        lower = line.lower()
        if not line:
            lines.append("")
            continue
        if "source: placeholder" in lower:
            source_index = lower.find("source: placeholder")
            line = line[:source_index].strip()
            if not line:
                continue
        line = line.replace("TITLE:", "").replace("SOURCE:", "")
        if "Placeholder for the verified India-only" in line:
            line = line.split("Placeholder for the verified India-only", 1)[0].strip()
            if not line:
                continue
        lines.append(_strip_artifacts(line))

    return _strip_artifacts("\n".join(lines)).strip()


def _strip_artifacts(text: str) -> str:
    text = re.sub(r":contentReference\[[^\]]+\]\{[^}]+\}", "", text)
    text = re.sub(r"\[oaicite:[^\]]+\]\{[^}]+\}", "", text)
    text = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"__(.*?)__", r"\1", text)
    text = re.sub(r"^\s*[-*]\s+", "- ", text, flags=re.MULTILINE)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"\s+---+\s*", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
