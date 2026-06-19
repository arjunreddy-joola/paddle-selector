import pytest
from src.utils.rule_matcher import build_lookup_key
from src.utils.parse_recommendation_notes import parse_recommendation_notes


def test_build_lookup_key_canonical_order():
    answers = {
        "gripFeel": "small",
        "playFrequency": "occasionally",
        "budget": "under_100",
        "playPriority": "power",
        "twoHandedBackhand": "yes",
        "upgradeOpenness": "yes",
    }
    fields = ["playFrequency", "budget", "playPriority", "twoHandedBackhand", "upgradeOpenness", "gripFeel"]
    key = build_lookup_key(answers, fields)
    assert key == "playFrequency=occasionally|budget=under_100|playPriority=power|twoHandedBackhand=yes|upgradeOpenness=yes|gripFeel=small"


def test_build_lookup_key_missing_field_raises():
    with pytest.raises(KeyError):
        build_lookup_key({"playFrequency": "weekly"}, ["playFrequency", "budget"])

def test_parse_notes_standard_format():
    notes = "Agassi - Recommended for you\nHyperion - Best Seller / Most Popular"
    result = parse_recommendation_notes(notes)
    assert result["recommendedForYou"] == "Agassi"
    assert result["bestSeller"] == "Hyperion"


def test_parse_notes_missing_both():
    result = parse_recommendation_notes("")
    assert result["recommendedForYou"] is None
    assert result["bestSeller"] is None


def test_parse_notes_only_recommended():
    notes = "Perseus - Recommended for you"
    result = parse_recommendation_notes(notes)
    assert result["recommendedForYou"] == "Perseus"
    assert result["bestSeller"] is None
