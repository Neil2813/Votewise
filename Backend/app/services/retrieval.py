from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from app.core.config import settings
from app.schemas.common import SourceHit
from app.utils.text import normalize, tokenize, unique_preserve_order


@dataclass(slots=True)
class Chunk:
    source: str
    section: str
    kind: str
    text: str


SECTION_ALIASES = {
    "eligibility": "eligibility to contest elections",
    "candidate eligibility": "eligibility to contest elections",
    "voting eligibility": "voting eligibility",
    "nomination": "nomination rules",
    "campaign": "campaign rules",
    "poll day": "poll day rules",
    "poll-day": "poll day rules",
    "voting methods": "voting methods",
    "expenditure": "election expenditure",
    "monitoring": "election monitoring",
    "misinformation": "election rules misconceptions",
    "myth": "election rules misconceptions",
    "fake news": "fake news & disinformation cases",
    "voter registration": "voter registration",
    "form 6": "voter registration",
    "epic": "voter registration",
    "aadhaar": "voter registration",
    "document": "voter registration",
    "accessibility": "polling station facilities",
    "facilities": "polling station facilities",
}

INTENT_TO_SOURCE = {
    "misinformation": "misinformation.txt",
    "myth": "misinformation.txt",
    "fake news": "misinformation.txt",
    "rumor": "misinformation.txt",
    "rumours": "misinformation.txt",
    "registration": "voter_registration.txt",
    "form 6": "voter_registration.txt",
    "epic": "voter_registration.txt",
    "aadhaar": "voter_registration.txt",
    "poll": "election_rules.txt",
    "candidate": "election_rules.txt",
    "nomination": "election_rules.txt",
    "campaign": "election_rules.txt",
    "expenditure": "election_rules.txt",
}


class KnowledgeBase:
    def __init__(self, data_dir: Path | None = None) -> None:
        self.data_dir = data_dir or settings.data_dir
        self.chunks: list[Chunk] = []
        self._load()

    def _load(self) -> None:
        self.chunks.clear()
        for file_path in sorted(self.data_dir.glob("*.txt")):
            self.chunks.extend(self._parse_file(file_path))

    def _parse_file(self, path: Path) -> list[Chunk]:
        """
        Parses files that use the following structure:

        SECTION: ...
        RULE: ...
        MYTH: ...
        REALITY: ...
        CASE: ...
        FACT: ...

        Important:
        - MYTH and REALITY must be stored as separate chunks.
        - Each marker flushes the previous buffer.
        """
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        source_name = path.name
        current_section = "general"
        current_kind = "fact"
        buffer: list[str] = []
        chunks: list[Chunk] = []

        def flush() -> None:
            nonlocal buffer
            text = "\n".join(line for line in buffer if line.strip()).strip()
            if text:
                chunks.append(
                    Chunk(
                        source=source_name,
                        section=current_section,
                        kind=current_kind,
                        text=text,
                    )
                )
            buffer = []

        for line in lines:
            stripped = line.strip()

            if not stripped:
                if buffer:
                    buffer.append("")
                continue

            if stripped.startswith("SECTION:"):
                flush()
                current_section = stripped.split("SECTION:", 1)[1].strip().lower()
                current_kind = "rule"
                continue

            if stripped.startswith("MYTH:"):
                flush()
                current_kind = "myth"
                buffer.append(stripped.split("MYTH:", 1)[1].strip())
                continue

            if stripped.startswith("REALITY:"):
                flush()  # critical fix: do not merge myth and reality into one chunk
                current_kind = "reality"
                buffer.append(stripped.split("REALITY:", 1)[1].strip())
                continue

            if stripped.startswith("CASE:"):
                flush()
                current_kind = "case"
                buffer.append(stripped.split("CASE:", 1)[1].strip())
                continue

            if stripped.startswith("FACT:"):
                # FACT can appear after CASE or as a standalone factual block
                if current_kind not in {"fact", "case"}:
                    flush()
                current_kind = "fact"
                buffer.append(stripped.split("FACT:", 1)[1].strip())
                continue

            if stripped.startswith("RULE:"):
                flush()
                current_kind = "rule"
                buffer.append(stripped.split("RULE:", 1)[1].strip())
                continue

            buffer.append(stripped)

        flush()
        return chunks

    def sources(self) -> list[str]:
        return unique_preserve_order(chunk.source for chunk in self.chunks)

    def _section_match_bonus(self, query: str, section: str) -> float:
        lowered = normalize(query)
        for key, canonical in SECTION_ALIASES.items():
            if key in lowered and canonical in section:
                return 3.0
        if section in lowered:
            return 2.5
        return 0.0

    def _score_chunk(self, query_norm: str, query_tokens: list[str], chunk: Chunk) -> float:
        text_norm = normalize(chunk.text)
        text_tokens = tokenize(text_norm)

        q_set = set(query_tokens)
        t_set = set(text_tokens)

        overlap = len(q_set & t_set)
        phrase_bonus = sum(1.2 for tok in query_tokens if tok in text_norm)
        section_bonus = self._section_match_bonus(query_norm, chunk.section)
        kind_bonus = 0.0

        if chunk.kind == "myth":
            kind_bonus = 0.25
        elif chunk.kind in {"reality", "fact"}:
            kind_bonus = 0.15
        elif chunk.kind == "case":
            kind_bonus = 0.1

        # Small help for negation-like claims
        neg_terms = (" not ", " no ", " without ", " cannot ", " can't ", " never ", " unregistered ")
        query_neg = any(term in f" {query_norm} " for term in neg_terms)
        text_neg = any(term in f" {text_norm} " for term in neg_terms)
        polarity_bonus = 0.0
        if query_neg == text_neg:
            polarity_bonus += 0.35
        elif query_neg and not text_neg:
            polarity_bonus -= 0.15

        exact_phrase_bonus = 0.0
        if query_norm == text_norm:
            exact_phrase_bonus = 5.0
        elif query_norm in text_norm or text_norm in query_norm:
            exact_phrase_bonus = 2.0

        length_penalty = min(len(t_set) / 250.0, 1.0) * 0.2

        score = (
            overlap * 1.0
            + phrase_bonus
            + section_bonus
            + kind_bonus
            + polarity_bonus
            + exact_phrase_bonus
            - length_penalty
        )
        return score

    def retrieve(
        self,
        query: str,
        top_k: int | None = None,
        source_hint: str | None = None,
    ) -> list[SourceHit]:
        top_k = top_k or settings.max_context_chunks
        query_norm = normalize(query)
        query_tokens = tokenize(query)
        if not query_tokens:
            query_tokens = tokenize(query.replace("-", " "))

        candidates = self.chunks
        source_from_intent = None

        for key, source in INTENT_TO_SOURCE.items():
            if key in query_norm:
                source_from_intent = source
                break

        if source_hint:
            candidates = [c for c in candidates if c.source == source_hint]
        elif source_from_intent:
            candidates = [c for c in candidates if c.source == source_from_intent]

        scored: list[tuple[float, Chunk]] = []
        for chunk in candidates:
            score = self._score_chunk(query_norm, query_tokens, chunk)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda item: item[0], reverse=True)

        return [
            SourceHit(
                source=chunk.source,
                section=chunk.section,
                kind=chunk.kind,
                score=round(score, 3),
                text=chunk.text[:1000],
            )
            for score, chunk in scored[:top_k]
        ]

    def exact_section(self, query: str) -> list[SourceHit]:
        q = normalize(query)
        matches: list[SourceHit] = []

        for chunk in self.chunks:
            if chunk.section and chunk.section in q:
                matches.append(
                    SourceHit(
                        source=chunk.source,
                        section=chunk.section,
                        kind=chunk.kind,
                        score=5.0,
                        text=chunk.text[:1000],
                    )
                )

        return matches

    def _iter_misinformation_pairs(self) -> Iterable[tuple[Chunk, Chunk | None]]:
        """
        Yield (myth_chunk, matching_reality_chunk) pairs from misinformation.txt.
        If a reality block is missing, reality_chunk will be None.
        """
        misinfo_chunks = [c for c in self.chunks if c.source == "misinformation.txt"]

        i = 0
        while i < len(misinfo_chunks):
            current = misinfo_chunks[i]

            if current.kind == "myth":
                reality_chunk = None
                if i + 1 < len(misinfo_chunks):
                    nxt = misinfo_chunks[i + 1]
                    if nxt.section == current.section and nxt.kind in {"reality", "fact"}:
                        reality_chunk = nxt
                        i += 1
                yield current, reality_chunk

            i += 1

    def lookup_myth(self, claim: str) -> SourceHit | None:
        """
        Returns the best matching misinformation chunk for a claim.

        Verdict mapping is handled elsewhere:
        - myth  -> False
        - reality/fact -> True
        - case -> Unverified/False depending on policy
        """
        claim_norm = normalize(claim)
        claim_tokens = tokenize(claim_norm)

        best: tuple[float, Chunk] | None = None

        # First pass: score myth/reality pairs so we keep them semantically aligned.
        for myth_chunk, reality_chunk in self._iter_misinformation_pairs():
            myth_score = self._score_chunk(claim_norm, claim_tokens, myth_chunk)
            best_local_score = myth_score
            best_local_chunk = myth_chunk

            if reality_chunk is not None:
                reality_score = self._score_chunk(claim_norm, claim_tokens, reality_chunk)
                if reality_score > best_local_score:
                    best_local_score = reality_score
                    best_local_chunk = reality_chunk

            if best is None or best_local_score > best[0]:
                best = (best_local_score, best_local_chunk)

        # Second pass: standalone factual/case chunks in misinformation.txt
        for chunk in (c for c in self.chunks if c.source == "misinformation.txt" and c.kind in {"fact", "case"}):
            score = self._score_chunk(claim_norm, claim_tokens, chunk)
            if best is None or score > best[0]:
                best = (score, chunk)

        if best and best[0] >= 0.75:
            chunk = best[1]
            return SourceHit(
                source=chunk.source,
                section=chunk.section,
                kind=chunk.kind,
                score=round(best[0], 3),
                text=chunk.text[:1000],
            )

        return None


kb = KnowledgeBase()