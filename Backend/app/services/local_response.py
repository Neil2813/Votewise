from __future__ import annotations

from app.schemas.common import SourceHit
from app.services.response_engine import clean_source_text


def summarize_hits(question: str, hits: list[SourceHit], max_items: int = 3) -> str:
    if not hits:
        return (
            "I could not verify this from the available India-only knowledge base. "
            "Please check the stored election rules or misinformation files."
        )

    lines = []
    for hit in hits[:max_items]:
        title = f"{hit.section.title()}" if hit.section else hit.source
        snippet = clean_source_text(hit.text)
        if len(snippet) > 260:
            snippet = snippet[:260].rstrip() + "..."
        lines.append(f"- {title}: {snippet}")
    return "\n".join(lines)


def build_rule_answer(question: str, hits: list[SourceHit]) -> str:
    if not hits:
        return (
            "I could not verify it from the current India-only knowledge base. "
            "Please use the verified rule files for a source-based answer."
        )
    summary = summarize_hits(question, hits)
    return (
        "Here is a simple answer:\n"
        f"{summary}\n\n"
        "This is a simple educational summary, not legal advice."
    )


def build_table_summary(left: str, right: str, hits: list[SourceHit]) -> str:
    if not hits:
        return "No verified comparison data was found in the available India-only files."
    rows = []
    for hit in hits[:4]:
        text = clean_source_text(hit.text)
        rows.append(f"{hit.section.title() if hit.section else 'Reference'}: {text[:220]}")
    return "Simple comparison:\n" + "\n".join(f"- {row}" for row in rows)
