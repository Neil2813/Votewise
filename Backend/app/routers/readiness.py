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
    completed = [key.replace("_", " ") for key, value in breakdown.items() if value]
    raw_result = (
        f"Readiness score: {score}%\n"
        f"Status: {label}\n\n"
        "Completed:\n"
        + ("\n".join(f"- {item}" for item in completed) if completed else "- Nothing completed yet")
        + "\n\nMissing steps:\n"
        + ("\n".join(f"- {item}" for item in missing) if missing else "- None")
    )

    prompt = f"""Convert this local readiness result into a simple voter-facing explanation.

{raw_result}

Use plain text only.
Do not use Markdown symbols.
"""

    result = await process_response(
        user_query="readiness score",
        rag_context=raw_result,
        lang=payload.lang,
        use_voice=payload.voice,
        prompt=prompt,
        fallback_text=raw_result,
        format_instruction="Start with the score and status. In Completed, list only completed items. Do not show no/false items under Completed.",
    )

    return StandardResponse(data=ResponseData(**result))
