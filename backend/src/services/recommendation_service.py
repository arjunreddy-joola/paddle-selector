from dataclasses import dataclass, field
from src.repositories.recommendation_rule_repository import RecommendationRuleRepository
from src.repositories.product_repository import ProductRepository
from src.types.paddle_selector_types import PaddleProduct, RecommendationRule


@dataclass
class ProductResult:
    productName: str
    product: PaddleProduct | None
    badge: str


@dataclass
class RecommendationResult:
    matchType: str  # "exact" | "none"
    ruleId: str | None
    recommendedForYou: ProductResult | None
    bestSeller: ProductResult | None
    otherPaddles: list
    metadata: dict


class RecommendationService:
    def __init__(self) -> None:
        self._rule_repo = RecommendationRuleRepository()
        self._product_repo = ProductRepository()

    def get_recommendation(self, answers: dict[str, str]) -> RecommendationResult:
        lookup_fields = self._rule_repo.get_lookup_fields()
        lookup_answers = {k: v for k, v in answers.items() if k in lookup_fields}
        if len(lookup_answers) < len(lookup_fields):
            return self._no_match()

        rule = self._rule_repo.find_by_answers(lookup_answers)
        if rule is None:
            return self._no_match()

        return self._build_result(rule)

    def _build_result(self, rule: RecommendationRule) -> RecommendationResult:
        recommended = self._resolve_product(
            rule.recommendedForYou.productName if rule.recommendedForYou else None,
            "Recommended for You",
        )
        best_seller = self._resolve_product(
            rule.bestSeller.productName if rule.bestSeller else None,
            "Best Seller / Most Popular",
        )

        top_names = set()
        if rule.recommendedForYou:
            top_names.add(rule.recommendedForYou.productName.lower())
        if rule.bestSeller:
            top_names.add(rule.bestSeller.productName.lower())

        other_paddles = []
        for raw_name in rule.otherPaddles:
            if raw_name.lower() not in top_names:
                product = self._product_repo.find_by_name(raw_name)
                other_paddles.append(
                    product.model_dump() if product else {"productName": raw_name, "product": None}
                )

        return RecommendationResult(
            matchType="exact",
            ruleId=rule.id,
            recommendedForYou=recommended,
            bestSeller=best_seller,
            otherPaddles=other_paddles,
            metadata={
                "fallbackUsed": rule.fallbackUsed,
                "requiresMerchandisingReview": rule.requiresMerchandisingReview,
            },
        )

    def _resolve_product(self, name: str | None, badge: str) -> ProductResult | None:
        if not name:
            return None
        product = self._product_repo.find_by_name(name)
        return ProductResult(productName=name, product=product, badge=badge)

    def _no_match(self) -> RecommendationResult:
        return RecommendationResult(
            matchType="none",
            ruleId=None,
            recommendedForYou=None,
            bestSeller=None,
            otherPaddles=[],
            metadata={"fallbackUsed": False, "requiresMerchandisingReview": True},
        )
