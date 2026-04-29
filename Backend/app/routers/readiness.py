from __future__ import annotations

from fastapi import APIRouter
from app.schemas.readiness import ReadinessRequest
from app.schemas.common import ResponseData, StandardResponse
from app.services.rules import compute_readiness
from app.services.response_engine import process_response

router = APIRouter(tags=["readiness"])


@router.post("/readiness-score", response_model=StandardResponse)
async def readiness_score(payload: ReadinessRequest) -> StandardResponse:
    score, label, breakdown, missing = compute_readiness(payload.model_dump())
    raw_result = (
        f"Readiness score: {score}%\n"
        f"Status: {label}\n\n"
        "Completed:\n"
        + "\n".join(f"- {key.replace('_', ' ')}: {'yes' if value else 'no'}" for key, value in breakdown.items())
        + "\n\nMissing steps:\n"
        + ("\n".join(f"- {item}" for item in missing) if missing else "- None")
    )

    prompt = f"""Convert this local readiness result into a simple voter-facing explanation.

{raw_result}
"""

    result = await process_response(
        user_query="readiness score",
        rag_context=raw_result,
        lang=payload.lang,
        use_voice=payload.voice,
        prompt=prompt,
        fallback_text=raw_result,
        format_instruction="Start with the score and status, then list missing steps.",
    )

    return StandardResponse(data=ResponseData(**result))
