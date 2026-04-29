from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.schemas.misinformation import MisinformationRequest, MisinformationResponse
from app.core.policy import detect_non_india_request, safe_block_message
from app.services.retrieval import kb
from app.services.llm.orchestrator import llm_orchestrator
from app.services.rules import local_myth_response

router = APIRouter(tags=["misinformation"])


SYSTEM_PROMPT = """You are a fact-checking assistant for India-only election claims.
Return verdict, explanation, and cite the matching stored myth/reality rule when present.
Be cautious: if the claim is not in the knowledge base, say Unverified.
"""


@router.post("/misinformation-check", response_model=MisinformationResponse)
async def misinformation_check(payload: MisinformationRequest) -> MisinformationResponse:
    claim = payload.claim.strip()
    if detect_non_india_request(claim):
        raise HTTPException(status_code=400, detail=safe_block_message())

    hits = kb.retrieve(claim, source_hint="misinformation.txt", top_k=4)
    matched = kb.lookup_myth(claim)

    prompt = f"""Claim:
{claim}

Stored references:
{chr(10).join(f'- {h.section} | {h.kind} | {h.text}' for h in hits)}

Return JSON-like text with:
Verdict: True / False / Unverified
Explanation: ...
Matched rule: ...
"""

    answer, provider = await llm_orchestrator.generate(SYSTEM_PROMPT, prompt)
    verdict, matched_rule = local_myth_response(claim)

    if provider == "local-failure":
        explanation = (
            "This claim was checked against the stored misinformation file. "
            "The claim is not fully verified by the current India-only knowledge base."
        )
        if verdict == "True" and matched_rule:
            explanation = "The stored file marks this as a verified fact."
        elif verdict == "False" and matched_rule:
            explanation = "The stored file treats this as a myth or false claim."
        return MisinformationResponse(
            verdict=verdict,
            explanation=explanation,
            matched_rule=matched_rule,
            sources=hits[:4],
            mode="local-template",
        )

    # Try to extract a safer structured result from the model output
    text = answer.strip()
    final_verdict = "Unverified"
    lower = text.lower()
    if "verdict:" in lower:
        for v in ("true", "false", "unverified"):
            if f"verdict: {v}" in lower:
                final_verdict = v.capitalize() if v != "unverified" else "Unverified"
                break

    explanation = text
    if not explanation:
        explanation = "The claim is not verified in the current India-only knowledge base."

    return MisinformationResponse(
        verdict=final_verdict,  # type: ignore[arg-type]
        explanation=explanation,
        matched_rule=matched.text if matched else matched_rule,
        sources=hits[:4],
        mode=provider,
    )
