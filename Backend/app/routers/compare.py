from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.compare import CompareRequest, CompareResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message
from app.services.retrieval import kb
from app.services.llm.orchestrator import llm_orchestrator
from app.services.local_response import build_table_summary

router = APIRouter(tags=["compare"])


SYSTEM_PROMPT = """You produce neutral India-only comparisons of election rules or roles.
Never recommend a candidate or party.
Use only the supplied context.
"""


@router.post("/compare", response_model=CompareResponse)
async def compare(payload: CompareRequest) -> CompareResponse:
    query = f"{payload.left} vs {payload.right} {payload.context or ''}".strip()
    if detect_non_india_request(query) or is_blocked_politically(query):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(query, top_k=5)
    context = "\n\n".join(f"[{h.source} | {h.section} | {h.kind}]\n{h.text}" for h in hits)

    prompt = f"""Compare the following neutrally:
Left: {payload.left}
Right: {payload.right}
Context: {payload.context or 'none'}

Retrieved knowledge:
{context}

Return concise bullet points and avoid voting recommendations.
"""

    answer, provider = await llm_orchestrator.generate(SYSTEM_PROMPT, prompt)
    if provider == "local-failure":
        answer = build_table_summary(payload.left, payload.right, hits)
        provider = "local-template"

    return CompareResponse(summary=answer, mode=provider, sources=hits[:5])
