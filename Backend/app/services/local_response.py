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
        if snippet:
            lines.append(f"- {title}: {snippet}")
    return "\n".join(lines)


def build_rule_answer(question: str, hits: list[SourceHit]) -> str:
    if not hits:
        return (
            "I could not find this in the current India-only election knowledge base.\n\n"
            "Please check official Election Commission of India information for the final rule."
        )
    summary = summarize_hits(question, hits)
    short_answer = _short_answer_for_question(question)
    return (
        f"{short_answer}\n\n"
        "Why:\n"
        f"{summary}\n\n"
        "What this means for a voter:\n"
        "- Your name must be on the electoral roll to vote.\n"
        "- ID proof helps confirm identity, but it does not replace voter-list entry.\n"
        "- If your name is missing, use the official voter registration or correction process before polling."
    )


def build_table_summary(left: str, right: str, hits: list[SourceHit]) -> str:
    if not hits:
        return (
            f"I could not find enough verified India-only information to compare {left} and {right}.\n\n"
            "Please try a narrower comparison, such as eligibility rules vs nomination rules."
        )
    rows = []
    for hit in hits[:4]:
        text = clean_source_text(hit.text)
        if text:
            rows.append(f"- {text[:260]}")
    return (
        f"Comparison: {left} vs {right}\n\n"
        "Key points from the available India election material:\n"
        + "\n".join(rows)
        + "\n\n"
        "Bottom line:\n"
        "These points explain the rule difference only. They are not a voting recommendation."
    )


def build_guide_answer(topic: str, hits: list[SourceHit]) -> str:
    if not hits:
        return (
            f"I could not find enough verified information to build a complete guide for {topic}.\n\n"
            "Use official Election Commission of India guidance for the final process."
        )

    details = summarize_hits(topic, hits, max_items=5)
    return (
        f"Guide: {topic}\n\n"
        "Overview:\n"
        "This guide explains the process in simple terms using the available India-only election material.\n\n"
        "Main points:\n"
        f"{details}\n\n"
        "What to do next:\n"
        "- Check that your name and details are correct in the electoral roll.\n"
        "- Keep accepted identity documents ready before polling day.\n"
        "- Follow official polling-station instructions and avoid relying on rumors.\n"
        "- For legal or final procedural details, use official Election Commission of India sources."
    )


def _short_answer_for_question(question: str) -> str:
    lowered = question.lower()
    if "voter list" in lowered or "electoral roll" in lowered:
        return "Short answer: No. ID proof alone is not enough if the person's name is not on the voter list."
    return "Short answer: Here is the clearest explanation from the available India-only election material."
