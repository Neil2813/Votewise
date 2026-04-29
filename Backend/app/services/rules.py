from __future__ import annotations

from app.services.retrieval import kb


def guide_outline() -> str:
    return (
        "Eligibility\n"
        "Registration\n"
        "Nomination\n"
        "Poll-day process\n"
        "Do's and don'ts"
    )


def readiness_label(score: int) -> str:
    if score >= 90:
        return "Fully Ready"
    if score >= 70:
        return "Mostly Ready"
    if score >= 50:
        return "Partially Ready"
    return "Not Ready"


def compute_readiness(payload: dict) -> tuple[int, str, dict[str, bool], list[str]]:
    fields = {
        "registration_done": bool(payload.get("registration_done", False)),
        "documents_ready": bool(payload.get("documents_ready", False)),
        "guide_completed": bool(payload.get("guide_completed", False)),
        "simulation_done": bool(payload.get("simulation_done", False)),
        "polling_location_verified": bool(payload.get("polling_location_verified", False)),
        "understand_rights": bool(payload.get("understand_rights", False)),
    }
    weights = {
        "registration_done": 25,
        "documents_ready": 20,
        "guide_completed": 15,
        "simulation_done": 15,
        "polling_location_verified": 15,
        "understand_rights": 10,
    }
    score = sum(weights[k] for k, v in fields.items() if v)
    missing_map = {
        "registration_done": "Complete voter registration",
        "documents_ready": "Keep required documents ready",
        "guide_completed": "Review the election guide",
        "simulation_done": "Finish the simulator flow",
        "polling_location_verified": "Verify polling location",
        "understand_rights": "Review voter rights and poll-day rules",
    }
    missing = [missing_map[k] for k, v in fields.items() if not v]
    return score, readiness_label(score), fields, missing


def local_myth_response(claim: str) -> tuple[str, str | None]:
    hit = kb.lookup_myth(claim)
    if not hit:
        return "Unverified", None
    if hit.kind == "myth":
        return "False", hit.text
    if hit.kind in {"reality", "fact"}:
        return "True", hit.text
    return "Unverified", hit.text
