from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from threading import Lock

from src.repositories.question_repository import QuestionRepository
from src.services.recommendation_service import RecommendationService
from src.schemas.paddle_selector_schemas import (
    RecommendationMetadata,
    RecommendationResponse,
    ProductResponse,
    ProductResultResponse,
)

_q_repo = QuestionRepository()
_LOOKUP_QUESTIONS = _q_repo.get_lookup_questions()  # sorted by order, usedForExactLookup only

OPENING_MESSAGE = (
    "Hey! I'm JOOLA's AI paddle advisor — let's find your perfect paddle!\n\n"
    + _LOOKUP_QUESTIONS[0].questionText
)

OPENING_UI_HINT: dict = {
    "type": "chips",
    "options": [{"label": o.label, "value": o.value} for o in _LOOKUP_QUESTIONS[0].options],
    "progressStep": 1,
    "progressTotal": len(_LOOKUP_QUESTIONS),
}


@dataclass
class ChatSession:
    session_id: str
    answers: dict[str, str] = field(default_factory=dict)
    answered_count: int = 0
    is_complete: bool = False
    recommendation: RecommendationResponse | None = None


@dataclass
class ChatMessageResult:
    session_id: str
    assistant_message: str
    is_complete: bool = False
    summary: str | None = None
    recommendation: RecommendationResponse | None = None
    ui_hint: dict | None = None


class ChatService:
    def __init__(self) -> None:
        self._rec_service = RecommendationService()
        self._sessions: dict[str, ChatSession] = {}
        self._lock = Lock()

    def create_session(self) -> ChatSession:
        session = ChatSession(session_id=str(uuid.uuid4()))
        with self._lock:
            self._sessions[session.session_id] = session
        return session

    def send_message(self, session_id: str, user_message: str) -> ChatMessageResult:
        session = self._get_session(session_id)
        if session.is_complete:
            raise ValueError("CHAT_SESSION_ALREADY_COMPLETE: Session has already received a recommendation")

        current_q = _LOOKUP_QUESTIONS[session.answered_count]
        session.answers[current_q.id] = user_message
        session.answered_count += 1

        if session.answered_count == len(_LOOKUP_QUESTIONS):
            return self._finalize(session)

        next_q = _LOOKUP_QUESTIONS[session.answered_count]
        return ChatMessageResult(
            session_id=session_id,
            assistant_message=next_q.questionText,
            ui_hint={
                "type": "chips",
                "options": [{"label": o.label, "value": o.value} for o in next_q.options],
                "progressStep": session.answered_count + 1,
                "progressTotal": len(_LOOKUP_QUESTIONS),
            },
        )

    def _finalize(self, session: ChatSession) -> ChatMessageResult:
        rec_result = self._rec_service.get_recommendation(session.answers)
        rec_response = self._to_recommendation_response(rec_result)

        session.is_complete = True
        session.recommendation = rec_response

        summary = "Here's your perfect JOOLA paddle match!"

        return ChatMessageResult(
            session_id=session.session_id,
            assistant_message=summary,
            is_complete=True,
            summary=summary,
            recommendation=rec_response,
        )

    def _get_session(self, session_id: str) -> ChatSession:
        with self._lock:
            session = self._sessions.get(session_id)
        if session is None:
            raise ValueError(f"CHAT_SESSION_NOT_FOUND: {session_id}")
        return session

    def _to_recommendation_response(self, result) -> RecommendationResponse:
        def _product(p) -> ProductResponse | None:
            if p is None:
                return None
            return ProductResponse(
                id=p.id,
                name=p.name,
                slug=p.slug,
                imageUrl=p.imageUrl,
                productUrl=p.productUrl,
                price=p.price,
                tags=p.tags,
            )

        def _product_result(r) -> ProductResultResponse | None:
            if r is None:
                return None
            return ProductResultResponse(
                productName=r.productName,
                product=_product(r.product),
                badge=r.badge,
            )

        return RecommendationResponse(
            matchType=result.matchType,
            ruleId=result.ruleId,
            recommendedForYou=_product_result(result.recommendedForYou),
            bestSeller=_product_result(result.bestSeller),
            otherPaddles=result.otherPaddles,
            metadata=RecommendationMetadata(
                fallbackUsed=result.metadata.get("fallbackUsed", False),
                requiresMerchandisingReview=result.metadata.get("requiresMerchandisingReview", False),
            ),
        )
