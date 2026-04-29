from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.guide import GuideRequest, GuideResponse
from app.core.policy import detect_non_india_request, safe_block_message
from app.services.retrieval import kb
from app.services.llm.orchestrator import llm_orchestrator
from app.services.local_response import build_rule_answer

router = APIRouter(tags=["guide"])


SYSTEM_PROMPT = """You generate concise India-only election process guides.
You must be neutral, factual, and educational.
Use retrieved knowledge first.
Never invent law or procedure not supported by the stored sources.
"""


@router.post("/generate-guide", response_model=GuideResponse)
async def generate_guide(payload: GuideRequest) -> GuideResponse:
    topic = payload.topic.strip()
    if detect_non_india_request(topic):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(topic, top_k=5)
    context = "\n\n".join(f"[{h.source} | {h.section} | {h.kind}]\n{h.text}" for h in hits)

    prompt = f"""Topic: {topic}
Audience: {payload.audience or 'general'}

Must include:
- eligibility
- registration
- nomination
- poll-day process
- do's and don'ts

Retrieved knowledge:
{context}
"""

    answer, provider = await llm_orchestrator.generate(SYSTEM_PROMPT, prompt)
    if provider == "local-failure":
        answer = (
            "Eligibility\n"
            "- Use verified India-only rules.\n\n"
            "Registration\n"
            "- Refer to the voter registration file when available.\n\n"
            "Nomination\n"
            "- Use the election rules file for nomination and oath requirements.\n\n"
            "Poll-day process\n"
            "- Follow poll-day rules from the election rules file.\n\n"
            "Do's and don'ts\n"
            "- Do stay neutral, follow official instructions, and avoid prohibited conduct."
        )
        provider = "local-template"

    if not hits:
        answer = build_rule_answer(topic, hits)

    return GuideResponse(guide=answer, mode=provider, sources=hits[:5])
