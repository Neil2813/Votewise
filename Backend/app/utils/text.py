from __future__ import annotations

import re
from typing import Iterable

STOPWORDS = {
    "the", "a", "an", "and", "or", "to", "of", "in", "for", "on", "by", "is", "are",
    "was", "were", "be", "been", "it", "this", "that", "as", "with", "at", "from",
    "can", "could", "should", "would", "may", "might", "do", "does", "did", "about",
    "what", "which", "who", "whom", "when", "where", "why", "how",
}

TOKEN_RE = re.compile(r"[a-z0-9]+")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def tokenize(text: str) -> list[str]:
    return [t for t in TOKEN_RE.findall(text.lower()) if t not in STOPWORDS and len(t) > 1]


def unique_preserve_order(items: Iterable[str]) -> list[str]:
    seen = set()
    out = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out
