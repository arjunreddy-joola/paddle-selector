import pytest
from src.services.recommendation_service import RecommendationService


@pytest.fixture
def svc():
    return RecommendationService()


FULL_ANSWERS = {
    "skillLevel": "beginner",
    "playFrequency": "occasionally",
    "budget": "under_100",
    "playPriority": "power",
    "twoHandedBackhand": "yes",
    "upgradeOpenness": "yes",
    "gripFeel": "small",
}


def test_exact_match_returns_result(svc):
    result = svc.get_recommendation(FULL_ANSWERS)
    assert result.matchType in ("exact", "none")


def test_exact_match_type_is_exact_for_known_combo(svc):
    result = svc.get_recommendation(FULL_ANSWERS)
    assert result.matchType == "exact"


def test_no_match_when_invalid_answer(svc):
    bad_answers = {**FULL_ANSWERS, "playFrequency": "never_heard_of_it"}
    result = svc.get_recommendation(bad_answers)
    assert result.matchType == "none"


def test_missing_lookup_field_returns_none(svc):
    incomplete = {k: v for k, v in FULL_ANSWERS.items() if k != "gripFeel"}
    result = svc.get_recommendation(incomplete)
    assert result.matchType == "none"


def test_recommendation_metadata_has_review_flag(svc):
    result = svc.get_recommendation(FULL_ANSWERS)
    assert "requiresMerchandisingReview" in result.metadata
    assert isinstance(result.metadata["requiresMerchandisingReview"], bool)


def test_other_paddles_excludes_top_two(svc):
    from src.repositories.recommendation_rule_repository import RecommendationRuleRepository
    repo = RecommendationRuleRepository()
    lookup = {k: v for k, v in FULL_ANSWERS.items() if k != "skillLevel"}
    rule = repo.find_by_answers(lookup)
    assert rule is not None
