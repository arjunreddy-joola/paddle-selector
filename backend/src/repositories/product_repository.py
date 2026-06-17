import re
import logging
from src.repositories.file_repository import read_json
from src.types.paddle_selector_types import PaddleProduct, ProductsFile

logger = logging.getLogger(__name__)


class ProductRepository:
    def __init__(self) -> None:
        from src.config import settings
        from src.repositories.shopify_source import fetch_shopify_products

        products = None
        if settings.shopify_store_url:
            try:
                products = fetch_shopify_products(settings.shopify_store_url)
                if not products:
                    products = None  # empty result → fall back
            except Exception as e:
                logger.warning(
                    f"Shopify fetch failed, falling back to products.json: {e}"
                )

        if products is None:
            raw = read_json("products.json")
            parsed = ProductsFile.model_validate(raw)
            products = [p for p in parsed.products if p.isActive]

        self._products = products
        self._by_id = {p.id: p for p in self._products}
        self._by_slug = {p.slug: p for p in self._products}

    def get_all(self) -> list[PaddleProduct]:
        return self._products

    def get_by_id(self, product_id: str) -> PaddleProduct | None:
        return self._by_id.get(product_id)

    def find_by_name(self, name: str) -> PaddleProduct | None:
        target = self._normalize(name)
        if not target:
            return None
        target_words = set(target.split())

        # 1. Exact match on normalized names — always the best result
        for p in self._products:
            if self._normalize(p.name) == target:
                return p

        # 2. All the rule-name words appear in the product name.
        #    Among candidates, prefer the BASE model: the one whose title
        #    has the fewest *extra* words beyond what the rule asked for.
        #    "scorpeus pro iv" -> prefers "JOOLA Scorpeus Pro IV 16mm ..."
        #    over "Anna Bright Scorpeus Pro IV 14mm ... - Lime Pop"
        candidates = []
        for p in self._products:
            pwords = set(self._normalize(p.name).split())
            if target_words and target_words.issubset(pwords):
                extra_words = len(pwords - target_words)
                has_url = 0 if p.productUrl else 1  # prefer ones with a URL
                candidates.append((has_url, extra_words, p))

        if not candidates:
            return None
        # Sort: URL-having first, then fewest extra words (the base model)
        candidates.sort(key=lambda c: (c[0], c[1]))
        return candidates[0][2]

    def report_unmatched(self, names: list[str]) -> list[str]:
        """Given recommendation paddle names, return the ones that match no
        product. Logged at startup so the team has an actionable list."""
        unmatched = sorted({n for n in names if self.find_by_name(n) is None})
        if unmatched:
            logger.warning(
                f"{len(unmatched)} recommended paddle(s) have no catalog match: "
                + ", ".join(unmatched)
            )
        return unmatched

    @staticmethod
    def _normalize(text: str) -> str:
        t = (text or "").lower()
        # Drop brand and generic words that aren't distinguishing
        for noise in ["joola", "pickleball", "paddle", "edition"]:
            t = t.replace(noise, " ")
        # Drop thickness like 14mm / 16mm and punctuation
        t = re.sub(r"\b\d{2}mm\b", " ", t)
        t = re.sub(r"[^a-z0-9 ]", " ", t)
        return re.sub(r"\s+", " ", t).strip()