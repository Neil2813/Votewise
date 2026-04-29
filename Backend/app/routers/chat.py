from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.schemas.common import ResponseData, StandardResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message
from app.services.retrieval import kb
from app.services.local_response import build_rule_answer
from app.services.response_engine import process_response

router = APIRouter(tags=["chat"])


SYSTEM_PROMPT = """You are VOTEWISE AI, an India-only election education assistant.
Rules:
- Stay neutral, factual, educational, and source-grounded.
- Use only India-specific information.
- Never promote any political party or candidate.
- If the retrieved knowledge is sufficient, answer directly and briefly.
- If the knowledge is partial, explain clearly and do not overclaim.
- If the answer is not in the current knowledge base, say so.
"""


@router.post("/chat", response_model=StandardResponse)
async def chat(payload: ChatRequest) -> StandardResponse:
    q = payload.question.strip()
    if detect_non_india_request(q) or is_blocked_politically(q):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(q)
    if hits:
        context = "\n\n".join(
            f"[{h.source} | {h.section} | {h.kind} | score={h.score}]\n{h.text}"
            for h in hits
        )
    else:
        context = ""

    history_text = "\n".join(f"{m.role}: {m.content}" for m in payload.history[-6:])
    prompt = f"""Question: {q}

Short history:
{history_text}

Retrieved knowledge:
{context}

Answer in 1-6 short paragraphs. Mention uncertainty when needed.
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
