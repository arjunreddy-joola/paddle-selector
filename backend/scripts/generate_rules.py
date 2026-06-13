#!/usr/bin/env python3
"""
Generates all 1,728 combination placeholder rules.
Run: python scripts/generate_rules.py

Each generated rule has requiresMerchandisingReview=true and fallbackUsed=true.
Populate real data using: python scripts/import_from_excel.py --file <path>
"""
import itertools
import json
from pathlib import Path

LOOKUP_FIELDS = [
    "playFrequency",
    "budget",
    "playPriority",
    "twoHandedBackhand",
    "upgradeOpenness",
    "gripFeel",
]

FIELD_VALUES: dict[str, list[str]] = {
    "playFrequency": ["occasionally", "weekly", "multiple_times_per_week"],
    "budget": ["under_100", "100_200", "200_plus", "no_budget"],
    "playPriority": ["power", "control", "balance", "spin"],
    "twoHandedBackhand": ["yes", "no", "sometimes"],
    "upgradeOpenness": ["yes", "maybe", "no"],
    "gripFeel": ["small", "average", "large", "not_sure_first_paddle"],
}

EXCEL_VALUES: dict[str, dict[str, str]] = {
    "playFrequency": {
        "occasionally": "Occasionally",
        "weekly": "Weekly",
        "multiple_times_per_week": "Multiple times per week",
    },
    "budget": {
        "under_100": "Under $100",
        "100_200": "$100–$200",
        "200_plus": "$200+ (premium performance)",
        "no_budget": "No budget",
    },
    "playPriority": {
        "power": "Power",
        "control": "Control",
        "balance": "Balanced",
        "spin": "Spin",
    },
    "twoHandedBackhand": {"yes": "Yes", "no": "No", "sometimes": "Sometimes"},
    "upgradeOpenness": {"yes": "Yes", "maybe": "Maybe", "no": "No"},
    "gripFeel": {
        "small": "Small",
        "average": "Average / Just right",
        "large": "Large",
        "not_sure_first_paddle": "Not sure / This is my 1st paddle",
    },
}


def generate() -> None:
    combos = list(itertools.product(*[FIELD_VALUES[f] for f in LOOKUP_FIELDS]))
    assert len(combos) == 1728, f"Expected 1728 combos, got {len(combos)}"

    rules = []
    for i, combo in enumerate(combos):
        answers = dict(zip(LOOKUP_FIELDS, combo))
        excel_answers = {f: EXCEL_VALUES[f][v] for f, v in answers.items()}
        rules.append({
            "id": f"combo_{i+1:04d}",
            "comboNumber": i + 1,
            "answers": answers,
            "excelAnswers": excel_answers,
            "recommendedForYou": None,
            "bestSeller": None,
            "otherPaddles": [],
            "rawProductList": "",
            "rawNotes": "",
            "requiresMerchandisingReview": True,
            "fallbackUsed": True,
        })

    output = {
        "version": "1.0.0",
        "source": "Generated placeholder — populate from Excel All Combinations sheet",
        "lookupFields": LOOKUP_FIELDS,
        "rules": rules,
    }

    out_path = Path("src/data/recommendation_rules.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Generated {len(rules)} rules -> {out_path}")


if __name__ == "__main__":
    generate()
