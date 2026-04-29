from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.compare import CompareRequest
from app.schemas.common import ResponseData, StandardResponse
from app.core.policy import detect_non_india_request, is_blocked_politically, safe_block_message
from app.services.retrieval import kb
from app.services.local_response import build_table_summary
from app.services.response_engine import clean_source_text, process_response

router = APIRouter(tags=["compare"])


SYSTEM_PROMPT = """You produce neutral India-only comparisons of election rules or roles.
Never recommend a candidate or party.
Use retrieved knowledge as optional context, not as text to copy.
If retrieved knowledge is weak, incomplete, or placeholder-like, still explain using general India election knowledge.
Never expose raw retrieval labels, placeholders, indexes, Markdown symbols, or source wording.
Plain text only.
"""


@router.post("/compare", response_model=StandardResponse)
async def compare(payload: CompareRequest) -> StandardResponse:
    query = f"{payload.left} vs {payload.right} {payload.context or ''}".strip()
    if detect_non_india_request(query) or is_blocked_politically(query):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(query, top_k=5)
    context = "\n\n".join(
        f"[{h.section or h.kind or 'reference'}]\n{clean_source_text(h.text)}" for h in hits
    )

    prompt = f"""Compare the following neutrally:
Left: {payload.left}
Right: {payload.right}
Context: {payload.context or 'none'}

Retrieved knowledge, only if useful:
{context}

Return a helpful comparison and avoid voting recommendations.
Do not simply summarize retrieval.
"""

    result = await process_response(
        user_query=query,
        rag_context=context,
        lang=payload.lang,
        use_voice=payload.voice,
        system=SYSTEM_PROMPT,
        prompt=prompt,
        fallback_text=build_table_summary(payload.left, payload.right, hits),
        format_instruction="Use a clear comparison with labels for both sides. Do not use Markdown tables, source labels, placeholders, or raw retrieval wording.",
    )

    return StandardResponse(data=ResponseData(**result))
