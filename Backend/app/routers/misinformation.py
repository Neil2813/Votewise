from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.misinformation import MisinformationRequest
from app.schemas.common import ResponseData, StandardResponse
from app.core.policy import detect_non_india_request, safe_block_message
from app.services.retrieval import kb
from app.services.rules import local_myth_response
from app.services.response_engine import clean_source_text, process_response

router = APIRouter(tags=["misinformation"])


SYSTEM_PROMPT = """You are a fact-checking assistant for India-only election claims.
Return verdict, explanation, and cite the matching stored myth/reality rule when present.
Be cautious: if the claim is not in the knowledge base, say Unverified.
The user is asking you to analyze or debunk a claim, not to spread it.
"""


@router.post("/misinformation-check", response_model=StandardResponse)
async def misinformation_check(payload: MisinformationRequest) -> StandardResponse:
    claim = payload.claim.strip()
    if detect_non_india_request(claim):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(claim, source_hint="misinformation.txt", top_k=4)
    matched = kb.lookup_myth(claim)

    prompt = f"""Claim:
{claim}

Stored references:
{chr(10).join(f'- {h.section or h.kind or "reference"}: {clean_source_text(h.text)}' for h in hits)}

Return JSON-like text with:
Verdict: True / False / Unverified
Explanation: ...
Matched rule: ...
"""

    verdict, matched_rule = local_myth_response(claim)
    fallback = (
        f"Verdict: {verdict}\n\n"
        "Explanation: This claim was checked against the stored misinformation file. "
        "The claim is not fully verified by the current India-only knowledge base.\n\n"
        f"Matched rule: {clean_source_text(matched.text) if matched else clean_source_text(matched_rule or '') or 'No matching stored rule found.'}"
    )

    result = await process_response(
        user_query=claim,
        rag_context="\n".join(clean_source_text(h.text) for h in hits),
        lang=payload.lang,
        use_voice=payload.voice,
        system=SYSTEM_PROMPT,
        prompt=prompt,
        fallback_text=fallback,
        format_instruction="Use exactly these sections: Verdict, Explanation, Matched rule.",
    )

    return StandardResponse(data=ResponseData(**result))
