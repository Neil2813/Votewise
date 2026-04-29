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
    lowered = question.lower()
    if _is_campaign_question(lowered):
        return _campaign_answer(hits)

    if "form 6" in lowered:
        return _form6_answer()

    if "voter list" in lowered or "electoral roll" in lowered:
        return (
            "Short answer: No. A person cannot vote only by showing ID proof if their name is not on the voter list.\n\n"
            "Why this matters:\n"
            "- In India, the polling staff checks the voter's name in the electoral roll.\n"
            "- ID proof is used to confirm identity after the name is found in the roll.\n"
            "- If the name is missing, ID proof does not create voting eligibility on polling day.\n\n"
            "What the voter should do:\n"
            "- Check the electoral roll before polling day.\n"
            "- If the name is missing or details are wrong, use the official registration or correction process.\n"
            "- On polling day, carry accepted ID proof, but also make sure the name is listed."
        )

    if not hits:
        return (
            "I could not find this in the current India-only election knowledge base.\n\n"
            "Please check official Election Commission of India information for the final rule."
        )
    summary = summarize_hits(question, hits)
    short_answer = _short_answer_for_question(question)
    action_block = _action_block_for_question(lowered)
    return (
        f"{short_answer}\n\n"
        "Key points:\n"
        f"{summary}\n\n"
        f"{action_block}"
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
    if _is_campaign_question(lowered):
        return "Short answer: Campaigning must stop during the silence period before polling, and campaign activity needs to follow Election Commission rules."
    if "form 6" in lowered:
        return "Short answer: Form 6 is used to apply for voter registration in India."
    return "Short answer: Here is the clearest explanation from the available India-only election material."


def _form6_answer() -> str:
    return (
        "Short answer: Form 6 is the application form used to register as a voter in India.\n\n"
        "Who uses it:\n"
        "- A first-time voter who wants their name added to the electoral roll.\n"
        "- A person who has shifted to a new constituency and needs to register there.\n"
        "- An eligible Indian citizen who is not currently listed as a voter in that constituency.\n\n"
        "What it usually asks for:\n"
        "- Basic personal details such as name, age, date of birth, and address.\n"
        "- Proof of age and proof of ordinary residence.\n"
        "- A declaration that the information given is correct.\n\n"
        "What happens after submission:\n"
        "- Election officials review the application.\n"
        "- If needed, verification may be done.\n"
        "- Once accepted, the person's name is added to the electoral roll.\n\n"
        "Important note:\n"
        "Submitting Form 6 is not the same as being immediately eligible to vote. The name must actually appear in the electoral roll before polling day."
    )


def _is_campaign_question(lowered: str) -> bool:
    return any(word in lowered for word in ("campaign", "campaigning", "canvass", "rally", "polling"))


def _campaign_answer(hits: list[SourceHit]) -> str:
    relevant = [
        clean_source_text(hit.text)
        for hit in hits
        if hit.section and "campaign" in hit.section.lower() and clean_source_text(hit.text)
    ]
    if not relevant:
        relevant = [
            "Campaign meetings and processions are not allowed during the 48-hour silence period before polling ends.",
            "Vehicles used for campaigning need prior approval from the Returning Officer.",
            "Campaign offices should not be set up near polling stations or restricted places such as schools, hospitals, or religious places.",
        ]

    points = "\n".join(f"- {item}" for item in relevant[:4])
    return (
        "Short answer: Campaigning is allowed only within the limits set by election rules. "
        "The most important rule before polling is the silence period.\n\n"
        "Before polling:\n"
        f"{points}\n\n"
        "What candidates and campaign teams should do:\n"
        "- Stop public campaigning during the silence period.\n"
        "- Use only approved campaign vehicles and permitted campaign spaces.\n"
        "- Avoid campaigning near polling stations or places where voters may feel pressured.\n"
        "- Follow instructions from the Election Commission, Returning Officer, and local election officials."
    )


def _action_block_for_question(lowered: str) -> str:
    if any(word in lowered for word in ("form 6", "registration", "register")):
        return (
            "What to do next:\n"
            "- Check the official voter registration process.\n"
            "- Keep required documents ready.\n"
            "- Verify that your details appear correctly in the electoral roll."
        )
    if any(word in lowered for word in ("misinformation", "rumor", "rumour", "fake", "myth")):
        return (
            "How to handle it:\n"
            "- Do not forward the claim immediately.\n"
            "- Compare it with official Election Commission information.\n"
            "- Treat unverified election claims carefully."
        )
    return (
        "What this means:\n"
        "- Use this as a simple educational explanation.\n"
        "- For final legal or procedural details, check official Election Commission of India guidance."
    )
