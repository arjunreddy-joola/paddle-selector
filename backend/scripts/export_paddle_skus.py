"""Export every JOOLA paddle's name, SKU, price, and URL from Shopify to a CSV.

Purpose: give the team a single reference list of paddle -> SKU so they can
fill in the SKU column on the recommendation Excel sheet without hunting each
one down manually.

Run:
    python scripts/export_paddle_skus.py
Output:
    paddle_skus.csv  (in the current directory)

This is a read-only helper. It does NOT touch the app, the Excel sheet, or any
data files — it just reads Shopify and writes a CSV for humans to use.
"""
from __future__ import annotations

import csv
import re
import time

import requests

STORE_URL = "https://joola.com"
OUTPUT_FILE = "paddle_skus.csv"

# Same accessory filter used in shopify_source.py, so this list matches
# the paddles the app actually considers.
_NON_PADDLE_TERMS = [
    "cover", "case", "bag", "tag", "grip", "overgrip", "tape", "ball",
    "shirt", "hat", "cap", "sock", "towel", "sticker", "luggage", "apparel",
]


def _is_paddle(title: str) -> bool:
    t = title.lower()
    if "paddle" not in t:
        return False
    return not any(re.search(rf"\b{term}\b", t) for term in _NON_PADDLE_TERMS)


def _get_with_retry(url: str, max_attempts: int = 5) -> requests.Response:
    """GET with backoff on HTTP 429, honoring the Retry-After header."""
    for attempt in range(max_attempts):
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        if resp.status_code == 429:
            retry_after = resp.headers.get("Retry-After", "")
            wait = int(retry_after) if retry_after.isdigit() else 10 * (attempt + 1)
            print(f"Rate limited (429); waiting {wait}s then retrying "
                  f"(attempt {attempt + 1}/{max_attempts})...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        return resp
    raise RuntimeError(f"Still rate limited after {max_attempts} attempts: {url}")


def fetch_paddles(store_url: str) -> list[dict]:
    rows: list[dict] = []
    page = 1
    seen: set[str] = set()

    while page < 10:
        url = f"{store_url.rstrip('/')}/products.json?limit=250&page={page}"
        resp = _get_with_retry(url)
        batch = resp.json().get("products", [])
        if not batch:
            break

        for p in batch:
            title = p.get("title", "")
            if not _is_paddle(title):
                continue
            handle = p.get("handle", "")
            if not handle or handle in seen:
                continue
            seen.add(handle)

            # A product can have multiple variants (e.g. 14mm / 16mm), each with
            # its own SKU. List them all so the team can pick the right one.
            variants = p.get("variants") or []
            if not variants:
                rows.append({
                    "product_name": title,
                    "variant": "",
                    "sku": "",
                    "price": "",
                    "url": f"{store_url}/products/{handle}",
                })
                continue

            for v in variants:
                rows.append({
                    "product_name": title,
                    "variant": v.get("title", ""),
                    "sku": v.get("sku", ""),
                    "price": v.get("price", ""),
                    "url": f"{store_url}/products/{handle}",
                })

        page += 1
        time.sleep(1)  # be polite between pages — avoid Shopify's rate limit

    return rows


def main() -> None:
    rows = fetch_paddles(STORE_URL)
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["product_name", "variant", "sku", "price", "url"]
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} paddle variants to {OUTPUT_FILE}")
    missing_sku = sum(1 for r in rows if not r["sku"])
    if missing_sku:
        print(f"Note: {missing_sku} variant(s) have no SKU set in Shopify.")


if __name__ == "__main__":
    main()