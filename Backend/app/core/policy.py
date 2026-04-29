from __future__ import annotations

from dataclasses import dataclass
import re

INDIA_ONLY_DISALLOWED_COUNTRIES = {
    "usa", "us", "united states", "uk", "united kingdom", "canada", "australia",
    "pakistan", "bangladesh", "nepal", "sri lanka", "france", "germany", "china",
}

MANIPULATION_PATTERNS = [
    r"how to rig",
    r"how to manipulate",
    r"fake voter",
    r"buy votes",
    r"vote for \w+",
    r"support \w+ party",
    r"spread misinformation",
    r"mislead voters",
    r"evm hack",
]


def detect_non_india_request(text: str) -> bool:
    lowered = text.lower()
    return any(country in lowered for country in INDIA_ONLY_DISALLOWED_COUNTRIES) and "india" not in lowered


def is_blocked_politically(text: str) -> bool:
    lowered = text.lower()
    return any(re.search(pattern, lowered) for pattern in MANIPULATION_PATTERNS)


def safe_block_message() -> str:
    return (
        "I can only help with India-only election education. "
        "I cannot assist with election manipulation, partisan persuasion, or misinformation."
    )
