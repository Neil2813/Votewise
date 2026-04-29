from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.guide import GuideRequest
from app.schemas.common import ResponseData, StandardResponse
from app.core.policy import detect_non_india_request, safe_block_message
from app.services.retrieval import kb
from app.services.local_response import build_guide_answer
from app.services.response_engine import clean_source_text, process_response

router = APIRouter(tags=["guide"])


SYSTEM_PROMPT = """You generate concise India-only election process guides.
You must be neutral, factual, and educational.
Use retrieved knowledge first.
Never invent law or procedure not supported by the stored sources.
"""


@router.post("/generate-guide", response_model=StandardResponse)
async def generate_guide(payload: GuideRequest) -> StandardResponse:
    topic = payload.topic.strip()
    if detect_non_india_request(topic):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(topic, top_k=5)
    context = "\n\n".join(
        f"[{h.section or h.kind or 'reference'}]\n{clean_source_text(h.text)}" for h in hits
    )

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

    fallback = build_guide_answer(topic, hits)

    result = await process_response(
        user_query=topic,
        rag_context=context,
        lang=payload.lang,
        use_voice=payload.voice,
        system=SYSTEM_PROMPT,
        prompt=prompt,
        fallback_text=fallback,
        format_instruction="Keep this as a practical step-by-step guide.",
    )

    return StandardResponse(data=ResponseData(**result))
