"""Fetches live product data from Shopify's public products.json endpoint
and maps it into the app's PaddleProduct shape.

Used by ProductRepository when SHOPIFY_STORE_URL is set, with a fallback
to the local products.json if the fetch fails — so the app is never worse
off than before.
"""
from __future__ import annotations

import logging
import re

import requests

from src.types.paddle_selector_types import PaddleProduct

logger = logging.getLogger(__name__)

# Titles containing these words are not paddles (accessories, apparel, etc.)
# Word-boundary matched so "ball" doesn't match inside "pickleBALL".
_NON_PADDLE_TERMS = [
    "cover", "case", "bag", "tag", "grip", "overgrip", "tape", "ball",
    "shirt", "hat", "cap", "sock", "towel", "sticker", "luggage", "apparel",
]


def _is_paddle(title: str) -> bool:
    t = title.lower()
    if "paddle" not in t:
        return False
    return not any(re.search(rf"\b{term}\b", t) for term in _NON_PADDLE_TERMS)


def fetch_shopify_products(store_url: str, timeout: int = 10) -> list[PaddleProduct]:
    """Fetch paddles from Shopify and return them as PaddleProduct objects.

    Raises on network/parse failure so the caller can fall back to the file.
    """
    products: list[PaddleProduct] = []
    page = 1
    seen_handles: set[str] = set()

    while page < 10:  # safety cap, same as the chatbot
        url = f"{store_url.rstrip('/')}/products.json?limit=250&page={page}"
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=timeout)
        resp.raise_for_status()
        batch = resp.json().get("products", [])
        if not batch:
            break

        for p in batch:
            title = p.get("title", "")
            if not _is_paddle(title):
                continue
            handle = p.get("handle", "")
            if not handle or handle in seen_handles:
                continue
            seen_handles.add(handle)

            variants = p.get("variants") or []
            first = variants[0] if variants else {}
            price_raw = first.get("price")
            try:
                price = float(price_raw) if price_raw is not None else None
            except (TypeError, ValueError):
                price = None

            images = p.get("images") or []
            image_url = images[0]["src"] if images and images[0].get("src") else None

            products.append(
                PaddleProduct(
                    id=handle,
                    name=title,
                    slug=handle,
                    imageUrl=image_url,
                    productUrl=f"{store_url.rstrip('/')}/products/{handle}",
                    price=price,
                    tags=(
                        p["tags"] if isinstance(p.get("tags"), list)
                        else [t.strip() for t in (p.get("tags") or "").split(",") if t.strip()]
                    ),
                    isActive=True,
                )
            )

        if len(batch) < 250:
            break
        page += 1

    logger.info(f"Shopify source: fetched {len(products)} paddles from {store_url}")
    return products