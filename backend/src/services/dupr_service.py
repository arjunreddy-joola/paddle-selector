from __future__ import annotations
import re

from src.repositories.dupr_rule_repository import DuprRuleRepository
from src.repositories.product_repository import ProductRepository
from src.services.recommendation_service import ProductResult, RecommendationResult, RecommendationService
from src.types.paddle_selector_types import DuprBand, DuprBandProductDefaults


_DUPR_PATTERN = re.compile(r"\b([3-8](?:\.\d)?)\b")


class DuprService:
    def __init__(self) -> None:
        self._dupr_repo = DuprRuleRepository()
        self._rec_service = RecommendationService()
        self._product_repo = ProductRepository()

    def parse_dupr_from_text(self, text: str) -> float | None:
        for match in _DUPR_PATTERN.findall(text):
            val = float(match)
            if 3.0 <= val <= 8.0:
                return round(val, 1)
        return None

    def find_band(self, rating: float) -> DuprBand | None:
        return self._dupr_repo.find_band_for_rating(rating)

    def get_recommendation(
        self,
        band: DuprBand,
        user_answers: dict[str, str],
    ) -> tuple[RecommendationResult, bool]:
        """Returns (result, dupr_overridden). dupr_overridden=True when
        the Excel result fell outside the band's primary pool and we substituted
        DUPR band defaults instead."""
        synthesized = {
            "playFrequency": band.hiddenPlayFrequency,
            "upgradeOpenness": band.hiddenUpgradeOpenness,
            **user_answers,
        }
        result = self._rec_service.get_recommendation(synthesized)

        if result.matchType == "none":
            overridden = self._apply_dupr_override(band, user_answers.get("playPriority", "balance"))
            return overridden, True

        # When the user answered the budget question the Excel result is already budget-filtered —
        # honour it directly instead of overriding with the primaryPool (which contains only
        # premium paddles and would ignore the user's price constraint).
        if "budget" in user_answers:
            return result, False

        excel_top = result.recommendedForYou.productName if result.recommendedForYou else None
        if excel_top and excel_top not in band.primaryPool:
            overridden = self._apply_dupr_override(band, user_answers.get("playPriority", "balance"))
            return overridden, True

        return result, False

    def build_explanation(self, band: DuprBand, dupr_rating: float) -> str:
        return band.explanationTemplate.replace("{dupr}", str(dupr_rating))

    # ── private ───────────────────────────────────────────────────

    def _apply_dupr_override(self, band: DuprBand, play_priority: str) -> RecommendationResult:
        by_priority = getattr(band.byPlayPriority, play_priority, None)
        pool: DuprBandProductDefaults = by_priority if by_priority else band.defaults

        rec_for_you = self._resolve(pool.recommendedForYou, "Recommended for You")
        best_seller = self._resolve(pool.bestSeller, "Best Seller / Most Popular")

        top_names = {n.lower() for n in [pool.recommendedForYou, pool.bestSeller] if n}
        other_paddles = []
        for name in pool.alsoConsider:
            if name.lower() not in top_names:
                product = self._product_repo.find_by_name(name)
                other_paddles.append(
                    product.model_dump() if product else {"productName": name, "product": None}
                )

        return RecommendationResult(
            matchType="exact",
            ruleId=f"dupr_{band.id}",
            recommendedForYou=rec_for_you,
            bestSeller=best_seller,
            otherPaddles=other_paddles,
            metadata={
                "fallbackUsed": False,
                "requiresMerchandisingReview": False,
                "duprOverride": True,
                "bandId": band.id,
            },
        )

    def _resolve(self, name: str | None, badge: str) -> ProductResult | None:
        if not name:
            return None
        product = self._product_repo.find_by_name(name)
        return ProductResult(productName=name, product=product, badge=badge)
