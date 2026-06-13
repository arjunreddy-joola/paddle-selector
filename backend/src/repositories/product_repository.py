from src.repositories.file_repository import read_json
from src.types.paddle_selector_types import PaddleProduct, ProductsFile


class ProductRepository:
    def __init__(self) -> None:
        raw = read_json("products.json")
        parsed = ProductsFile.model_validate(raw)
        self._products = [p for p in parsed.products if p.isActive]
        self._by_id = {p.id: p for p in self._products}
        self._by_slug = {p.slug: p for p in self._products}

    def get_all(self) -> list[PaddleProduct]:
        return self._products

    def get_by_id(self, product_id: str) -> PaddleProduct | None:
        return self._by_id.get(product_id)

    def find_by_name(self, name: str) -> PaddleProduct | None:
        name_lower = name.lower().strip()
        for p in self._products:
            if p.name.lower() == name_lower:
                return p
        # partial match: product name starts with the short name
        for p in self._products:
            if p.name.lower().startswith(name_lower):
                return p
        return None
