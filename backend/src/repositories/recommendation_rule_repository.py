from src.repositories.file_repository import read_json
from src.types.paddle_selector_types import RecommendationRule, RecommendationRulesFile
from src.utils.rule_matcher import build_lookup_key


class RecommendationRuleRepository:
    def __init__(self) -> None:
        raw = read_json("recommendation_rules.json")
        parsed = RecommendationRulesFile.model_validate(raw)
        self._rules = parsed.rules
        self._lookup_fields = parsed.lookupFields
        self._index: dict[str, RecommendationRule] = {}
        for rule in self._rules:
            key = build_lookup_key(rule.answers, self._lookup_fields)
            self._index[key] = rule

    def find_by_answers(self, answers: dict[str, str]) -> RecommendationRule | None:
        key = build_lookup_key(answers, self._lookup_fields)
        return self._index.get(key)

    def get_all(self) -> list[RecommendationRule]:
        return self._rules

    def get_lookup_fields(self) -> list[str]:
        return self._lookup_fields
