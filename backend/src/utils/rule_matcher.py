def build_lookup_key(answers: dict[str, str], lookup_fields: list[str]) -> str:
    """Build a deterministic lookup key from answer dict using field ordering."""
    parts = [f"{field}={answers[field]}" for field in lookup_fields]
    return "|".join(parts)
