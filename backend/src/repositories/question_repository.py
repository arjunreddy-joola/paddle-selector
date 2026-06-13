from src.repositories.file_repository import read_json
from src.types.paddle_selector_types import DuprFlow, Question, QuestionsFile


class QuestionRepository:
    def __init__(self) -> None:
        raw = read_json("questions.json")
        parsed = QuestionsFile.model_validate(raw)
        self._questions = sorted(parsed.questions, key=lambda q: q.order)
        self._by_id = {q.id: q for q in self._questions}
        if parsed.duprFlow:
            sorted_refining = sorted(parsed.duprFlow.refiningQuestions, key=lambda rq: rq.order)
            self._dupr_flow: DuprFlow | None = parsed.duprFlow.model_copy(
                update={"refiningQuestions": sorted_refining}
            )
        else:
            self._dupr_flow = None

    def get_all(self) -> list[Question]:
        return self._questions

    def get_by_id(self, question_id: str) -> Question | None:
        return self._by_id.get(question_id)

    def get_lookup_questions(self) -> list[Question]:
        return [q for q in self._questions if q.usedForExactLookup]

    def get_dupr_flow(self) -> DuprFlow | None:
        return self._dupr_flow

    def get_next_question(self, current_id: str) -> Question | None:
        ids = [q.id for q in self._questions]
        if current_id not in ids:
            return None
        idx = ids.index(current_id)
        return self._questions[idx + 1] if idx + 1 < len(self._questions) else None
