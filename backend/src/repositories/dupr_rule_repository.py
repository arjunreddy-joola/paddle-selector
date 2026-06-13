from src.repositories.file_repository import read_json
from src.types.paddle_selector_types import DuprBand, DuprRulesFile


class DuprRuleRepository:
    def __init__(self) -> None:
        raw = read_json("dupr-rating-rules.json")
        parsed = DuprRulesFile.model_validate(raw)
        self._bands = parsed.bands

    def find_band_for_rating(self, rating: float) -> DuprBand | None:
        for band in self._bands:
            if band.minDupr <= rating <= band.maxDupr:
                return band
        return None

    def get_all(self) -> list[DuprBand]:
        return self._bands
