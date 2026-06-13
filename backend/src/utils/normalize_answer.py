import re

_EXCEL_TO_VALUE: dict[str, str] = {
    "occasionally": "occasionally",
    "weekly": "weekly",
    "multiple times per week": "multiple_times_per_week",
    "under $100": "under_100",
    "$100–$200": "100_200",
    "$100-$200": "100_200",
    "$200+ (premium performance)": "200_plus",
    "$200+": "200_plus",
    "no budget": "no_budget",
    "power": "power",
    "control": "control",
    "balanced": "balance",
    "balance": "balance",
    "spin": "spin",
    "yes": "yes",
    "no": "no",
    "sometimes": "sometimes",
    "maybe": "maybe",
    "small": "small",
    "average / just right": "average",
    "average": "average",
    "large": "large",
    "not sure / this is my 1st paddle": "not_sure_first_paddle",
    "not sure": "not_sure_first_paddle",
    "beginner": "beginner",
    "intermediate": "intermediate",
    "advanced": "advanced",
}


def normalize_answer(raw: str) -> str:
    """Normalize a raw string answer to its canonical value key."""
    cleaned = raw.strip().lower()
    # Replace special dashes/hyphens with ascii dash for lookup
    cleaned = re.sub(r"[–—]", "-", cleaned)
    return _EXCEL_TO_VALUE.get(cleaned, cleaned.replace(" ", "_"))
