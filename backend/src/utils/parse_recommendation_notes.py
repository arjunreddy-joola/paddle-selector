import re
from typing import TypedDict


class ParsedNotes(TypedDict):
    recommendedForYou: str | None
    bestSeller: str | None


_RECOMMENDED_PATTERNS = [
    re.compile(r"^(.+?)\s*[-–]\s*Recommended for you", re.IGNORECASE | re.MULTILINE),
]
_BEST_SELLER_PATTERNS = [
    re.compile(r"^(.+?)\s*[-–]\s*Best Seller", re.IGNORECASE | re.MULTILINE),
    re.compile(r"^(.+?)\s*[-–]\s*Most Popular", re.IGNORECASE | re.MULTILINE),
]


def parse_recommendation_notes(notes: str) -> ParsedNotes:
    recommended_for_you: str | None = None
    best_seller: str | None = None

    for pattern in _RECOMMENDED_PATTERNS:
        match = pattern.search(notes)
        if match:
            recommended_for_you = match.group(1).strip()
            break

    for pattern in _BEST_SELLER_PATTERNS:
        match = pattern.search(notes)
        if match:
            best_seller = match.group(1).strip()
            break

    return {"recommendedForYou": recommended_for_you, "bestSeller": best_seller}
