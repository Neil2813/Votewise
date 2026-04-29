from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.schemas.common import ResponseData, StandardResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message
from app.services.retrieval import kb
from app.services.local_response import build_rule_answer
from app.services.response_engine import clean_source_text, process_response

router = APIRouter(tags=["chat"])


SYSTEM_PROMPT = """You are VOTEWISE AI, an India-only election education assistant.
Rules:
- Stay neutral, factual, educational, and helpful.
- Use only India-specific information.
- Never promote any political party or candidate.
- Use retrieved knowledge as supporting context, not as text to copy.
- If retrieved knowledge is weak, incomplete, or placeholder-like, still answer using general India election knowledge.
- Never expose raw retrieval labels, source names, placeholders, indexes, or database wording.
- Give a polished chatbot answer with a short direct answer, explanation, and practical next steps.
"""


@router.post("/chat", response_model=StandardResponse)
async def chat(payload: ChatRequest) -> StandardResponse:
    q = payload.question.strip()
    if detect_non_india_request(q) or is_blocked_politically(q):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(q)
    if hits:
        context = "\n\n".join(
            f"[{h.section or h.kind or 'reference'}]\n{clean_source_text(h.text)}"
            for h in hits
        )
    else:
        context = ""

    history_text = "\n".join(f"{m.role}: {m.content}" for m in payload.history[-6:])
    prompt = f"""Question: {q}

Short history:
{history_text}

Retrieved knowledge, only if useful:
{context}

Answer as a helpful chatbot for Indian election education.
Do not simply summarize retrieval.
If the retrieved text is thin or awkward, write a better explanation from your India election knowledge.
"""

    result = await process_response(
        user_query=q,
        rag_context=context,
        lang=payload.lang,
        use_voice=payload.voice,
        system=SYSTEM_PROMPT,
        prompt=prompt,
        fallback_text=build_rule_answer(q, hits),
    )

    return StandardResponse(data=ResponseData(**result))
