from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from enum import Enum
from threading import Lock

from src.repositories.question_repository import QuestionRepository
from src.services.recommendation_service import RecommendationService
from src.services.dupr_service import DuprService
from src.schemas.paddle_selector_schemas import (
    RecommendationMetadata,
    RecommendationResponse,
    ProductResponse,
    ProductResultResponse,
)


class ChatPhase(str, Enum):
    DUPR_DISCOVERY = "dupr_discovery"
    DUPR_INPUT = "dupr_input"
    DUPR_REFINING = "dupr_refining"
    STANDARD = "standard"
    COMPLETE = "complete"


_q_repo = QuestionRepository()
_LOOKUP_QUESTIONS = _q_repo.get_lookup_questions()
_DUPR_FLOW = _q_repo.get_dupr_flow()

if _DUPR_FLOW:
    OPENING_MESSAGE = _DUPR_FLOW.openingQuestion.questionText
    OPENING_UI_HINT: dict = {
        "type": "chips",
        "options": [{"label": o.label, "value": o.value} for o in _DUPR_FLOW.openingQuestion.options],
    }
else:
    OPENING_MESSAGE = (
        "Hey! I'm JOOLA's AI paddle advisor — let's find your perfect paddle!\n\n"
        + _LOOKUP_QUESTIONS[0].questionText
    )
    OPENING_UI_HINT = {
        "type": "chips",
        "options": [{"label": o.label, "value": o.value} for o in _LOOKUP_QUESTIONS[0].options],
        "progressStep": 1,
        "progressTotal": len(_LOOKUP_QUESTIONS),
    }


@dataclass
class ChatSession:
    session_id: str
    phase: ChatPhase
    answers: dict[str, str] = field(default_factory=dict)
    dupr_rating: float | None = None
    dupr_band_id: str | None = None
    refining_index: int = 0
    standard_index: int = 0
    is_complete: bool = False
    recommendation: RecommendationResponse | None = None
    dupr_metadata: dict | None = None


@dataclass
class ChatMessageResult:
    session_id: str
    assistant_message: str
    is_complete: bool = False
    summary: str | None = None
    recommendation: RecommendationResponse | None = None
    ui_hint: dict | None = None
    dupr_metadata: dict | None = None


class ChatService:
    def __init__(self) -> None:
        self._rec_service = RecommendationService()
        self._dupr_service = DuprService()
        self._sessions: dict[str, ChatSession] = {}
        self._lock = Lock()

    def create_session(self) -> ChatSession:
        initial_phase = ChatPhase.DUPR_DISCOVERY if _DUPR_FLOW else ChatPhase.STANDARD
        session = ChatSession(session_id=str(uuid.uuid4()), phase=initial_phase)
        with self._lock:
            self._sessions[session.session_id] = session
        return session

    def send_message(self, session_id: str, user_message: str) -> ChatMessageResult:
        session = self._get_session(session_id)
        if session.is_complete:
            raise ValueError("CHAT_SESSION_ALREADY_COMPLETE: Session has already received a recommendation")

        if session.phase == ChatPhase.DUPR_DISCOVERY:
            return self._handle_dupr_discovery(session, user_message)
        if session.phase == ChatPhase.DUPR_INPUT:
            return self._handle_dupr_input(session, user_message)
        if session.phase == ChatPhase.DUPR_REFINING:
            return self._handle_dupr_refining(session, user_message)
        return self._handle_standard(session, user_message)

    # ── DUPR discovery ────────────────────────────────────────────

    def _handle_dupr_discovery(self, session: ChatSession, user_message: str) -> ChatMessageResult:
        if user_message.strip().lower() in ("yes", "y"):
            session.phase = ChatPhase.DUPR_INPUT
            cfg = _DUPR_FLOW.duprRatingInput
            return ChatMessageResult(
                session_id=session.session_id,
                assistant_message=cfg.questionText,
                ui_hint={
                    "type": "text_input",
                    "placeholder": cfg.placeholder,
                    "helperText": cfg.helperText,
                    "min": cfg.min,
                    "max": cfg.max,
                },
            )
        session.phase = ChatPhase.STANDARD
        return self._ask_standard_question(session)

    # ── DUPR input ────────────────────────────────────────────────

    def _handle_dupr_input(self, session: ChatSession, user_message: str) -> ChatMessageResult:
        rating = self._dupr_service.parse_dupr_from_text(user_message)
        band = self._dupr_service.find_band(rating) if rating is not None else None

        if rating is None or band is None:
            cfg = _DUPR_FLOW.duprRatingInput
            return ChatMessageResult(
                session_id=session.session_id,
                assistant_message=cfg.errorMessage,
                ui_hint={
                    "type": "text_input",
                    "placeholder": cfg.placeholder,
                    "helperText": cfg.helperText,
                    "min": cfg.min,
                    "max": cfg.max,
                },
            )

        session.dupr_rating = rating
        session.dupr_band_id = band.id
        session.phase = ChatPhase.DUPR_REFINING
        return self._ask_refining_question(session)

    # ── DUPR refining ─────────────────────────────────────────────

    def _get_refining_questions(self, session: ChatSession) -> list:
        rqs = _DUPR_FLOW.refiningQuestions
        if session.dupr_rating is not None and session.dupr_rating >= 6.0:
            return [rq for rq in rqs if rq.questionId != "budget"]
        return list(rqs)

    def _ask_refining_question(self, session: ChatSession) -> ChatMessageResult:
        rqs = self._get_refining_questions(session)
        rq = rqs[session.refining_index]
        q = _q_repo.get_by_id(rq.questionId)
        return ChatMessageResult(
            session_id=session.session_id,
            assistant_message=rq.duprQuestionText,
            ui_hint={
                "type": "chips",
                "options": [{"label": o.label, "value": o.value} for o in q.options],
                "progressStep": session.refining_index + 1,
                "progressTotal": len(rqs),
            },
        )

    def _handle_dupr_refining(self, session: ChatSession, user_message: str) -> ChatMessageResult:
        rqs = self._get_refining_questions(session)
        rq = rqs[session.refining_index]
        session.answers[rq.questionId] = user_message
        session.refining_index += 1

        if session.refining_index < len(rqs):
            return self._ask_refining_question(session)
        return self._finalize_dupr(session)

    def _finalize_dupr(self, session: ChatSession) -> ChatMessageResult:
        band = self._dupr_service.find_band(session.dupr_rating)
        rec_result, dupr_overridden = self._dupr_service.get_recommendation(band, session.answers)
        rec_response = self._to_recommendation_response(rec_result)
        explanation = self._dupr_service.build_explanation(band, session.dupr_rating)

        dupr_meta = {
            "duprRating": session.dupr_rating,
            "bandId": band.id,
            "bandLabel": band.label,
            "skillTier": band.skillTier,
            "duprOverridden": dupr_overridden,
        }
        session.is_complete = True
        session.recommendation = rec_response
        session.dupr_metadata = dupr_meta

        return ChatMessageResult(
            session_id=session.session_id,
            assistant_message=explanation,
            is_complete=True,
            summary=explanation,
            recommendation=rec_response,
            dupr_metadata=dupr_meta,
        )

    # ── Standard flow ─────────────────────────────────────────────

    def _ask_standard_question(self, session: ChatSession) -> ChatMessageResult:
        q = _LOOKUP_QUESTIONS[session.standard_index]
        return ChatMessageResult(
            session_id=session.session_id,
            assistant_message=q.questionText,
            ui_hint={
                "type": "chips",
                "options": [{"label": o.label, "value": o.value} for o in q.options],
                "progressStep": session.standard_index + 1,
                "progressTotal": len(_LOOKUP_QUESTIONS),
            },
        )

    def _handle_standard(self, session: ChatSession, user_message: str) -> ChatMessageResult:
        current_q = _LOOKUP_QUESTIONS[session.standard_index]
        session.answers[current_q.id] = user_message
        session.standard_index += 1

        if session.standard_index < len(_LOOKUP_QUESTIONS):
            return self._ask_standard_question(session)
        return self._finalize_standard(session)

    def _finalize_standard(self, session: ChatSession) -> ChatMessageResult:
        rec_result = self._rec_service.get_recommendation(session.answers)
        rec_response = self._to_recommendation_response(rec_result)
        summary = "Here's your perfect JOOLA paddle match!"

        session.is_complete = True
        session.recommendation = rec_response

        return ChatMessageResult(
            session_id=session.session_id,
            assistant_message=summary,
            is_complete=True,
            summary=summary,
            recommendation=rec_response,
        )

    # ── Helpers ───────────────────────────────────────────────────

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
                description=p.description,
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
