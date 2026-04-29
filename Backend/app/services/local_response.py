from __future__ import annotations

from app.schemas.common import SourceHit


def summarize_hits(question: str, hits: list[SourceHit], max_items: int = 3) -> str:
    if not hits:
        return (
            "I could not verify this from the available India-only knowledge base. "
            "Please check the stored election rules or misinformation files."
        )

    lines = []
    for hit in hits[:max_items]:
        title = f"{hit.section.title()}" if hit.section else hit.source
        snippet = hit.text.replace("\n", " ").strip()
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
        "Verified source-based summary:\n"
        f"{summary}\n\n"
        "If the stored text is partial, the answer should be treated as a summary, not a legal opinion."
    )


def build_table_summary(left: str, right: str, hits: list[SourceHit]) -> str:
    if not hits:
        return "No verified comparison data was found in the available India-only files."
    rows = []
    for hit in hits[:4]:
        rows.append(f"{hit.section.title() if hit.section else hit.source}: {hit.text[:220].replace(chr(10), ' ')}")
    return "Comparison basis:\n" + "\n".join(f"- {row}" for row in rows)
