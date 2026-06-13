import uuid
from datetime import datetime, timezone
from src.repositories.session_repository import SessionRepository
from src.repositories.question_repository import QuestionRepository
from src.types.paddle_selector_types import PaddleSelectorSession, SessionStatus, Question


class SessionService:
    def __init__(self) -> None:
        self._session_repo = SessionRepository()
        self._question_repo = QuestionRepository()

    def create_session(self, source: str = "website", locale: str = "en-US") -> PaddleSelectorSession:
        questions = self._question_repo.get_all()
        first_question = questions[0] if questions else None
        now = datetime.now(timezone.utc)
        session = PaddleSelectorSession(
            id=str(uuid.uuid4()),
            status=SessionStatus.IN_PROGRESS,
            currentQuestionId=first_question.id if first_question else None,
            answers={},
            source=source,
            locale=locale,
            createdAt=now,
            updatedAt=now,
        )
        return self._session_repo.save(session)

    def get_session(self, session_id: str) -> PaddleSelectorSession:
        session = self._session_repo.get(session_id)
        if session is None:
            raise ValueError("SESSION_NOT_FOUND")
        return session

    def submit_answer(self, session_id: str, question_id: str, answer_value: str) -> PaddleSelectorSession:
        session = self.get_session(session_id)
        if session.status == SessionStatus.COMPLETED:
            raise ValueError("SESSION_ALREADY_COMPLETED")

        if session.currentQuestionId != question_id:
            raise ValueError("OUT_OF_ORDER")

        question = self._question_repo.get_by_id(question_id)
        if question is None:
            raise ValueError("INVALID_QUESTION_ID")

        valid_values = {opt.value for opt in question.options}
        if answer_value not in valid_values:
            raise ValueError(f"INVALID_ANSWER: '{answer_value}' not valid for '{question_id}'")

        answers = {**session.answers, question_id: answer_value}
        next_question = self._question_repo.get_next_question(question_id)
        now = datetime.now(timezone.utc)

        if next_question is None:
            updated = session.model_copy(update={
                "answers": answers,
                "currentQuestionId": None,
                "status": SessionStatus.COMPLETED,
                "completedAt": now,
                "updatedAt": now,
            })
        else:
            updated = session.model_copy(update={
                "answers": answers,
                "currentQuestionId": next_question.id,
                "updatedAt": now,
            })

        return self._session_repo.save(updated)

    def restart_session(self, session_id: str) -> PaddleSelectorSession:
        self.get_session(session_id)
        return self.create_session()

    def get_progress(self, session: PaddleSelectorSession) -> dict:
        total = len(self._question_repo.get_all())
        answered = len(session.answers)
        return {"answered": answered, "total": total}

    def get_current_question(self, session: PaddleSelectorSession) -> Question | None:
        if session.currentQuestionId is None:
            return None
        return self._question_repo.get_by_id(session.currentQuestionId)
