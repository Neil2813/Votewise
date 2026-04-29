from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message
from app.services.retrieval import kb
from app.services.local_response import build_rule_answer
from app.services.llm.orchestrator import llm_orchestrator

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


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
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

    answer, provider = await llm_orchestrator.generate(SYSTEM_PROMPT, prompt)
    mode = provider
    verified = bool(hits)

    if provider == "local-failure":
        answer = build_rule_answer(q, hits)
        mode = "local-template"

    return ChatResponse(answer=answer, mode=mode, verified=verified, sources=hits[:4])
