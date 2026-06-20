from src.services.session_service import SessionService
from src.services.recommendation_service import RecommendationService
from src.repositories.question_repository import QuestionRepository
from src.schemas.paddle_selector_schemas import (
    SessionInProgressResponse, SessionCompletedResponse,
    QuestionResponse, QuestionOptionResponse, ProgressResponse,
    ProductResultResponse, ProductResponse, RecommendationResponse,
    RecommendationMetadata,
)
from src.types.paddle_selector_types import PaddleSelectorSession, SessionStatus, Question


class PaddleSelectorService:
    def __init__(self) -> None:
        self._session_svc = SessionService()
        self._rec_svc = RecommendationService()
        self._question_repo = QuestionRepository()

    def create_session(self, source: str, locale: str) -> SessionInProgressResponse:
        session = self._session_svc.create_session(source=source, locale=locale)
        return self._build_in_progress(session)

    def get_session(self, session_id: str) -> SessionInProgressResponse | SessionCompletedResponse:
        session = self._session_svc.get_session(session_id)
        if session.status == SessionStatus.COMPLETED:
            return self._build_completed(session)
        return self._build_in_progress(session)

    def submit_answer(
        self, session_id: str, question_id: str, answer_value: str
    ) -> SessionInProgressResponse | SessionCompletedResponse:
        session = self._session_svc.submit_answer(session_id, question_id, answer_value)
        if session.status == SessionStatus.COMPLETED:
            return self._build_completed(session)
        return self._build_in_progress(session)

    def restart_session(self, session_id: str) -> SessionInProgressResponse:
        session = self._session_svc.restart_session(session_id)
        return self._build_in_progress(session)

    def get_stateless_recommendation(self, answers: dict[str, str]) -> RecommendationResponse:
        result = self._rec_svc.get_recommendation(answers)
        return self._build_recommendation_response(result)

    def get_all_questions(self) -> list[QuestionResponse]:
        questions = self._question_repo.get_all()
        return [self._to_question_response(q) for q in questions]

    # ── private builders ──────────────────────────────────────

    def _build_in_progress(self, session: PaddleSelectorSession) -> SessionInProgressResponse:
        current_q = self._session_svc.get_current_question(session)
        next_q = (
            self._question_repo.get_next_question(current_q.id)
            if current_q else None
        )
        progress = self._session_svc.get_progress(session)
        return SessionInProgressResponse(
            sessionId=session.id,
            status=session.status.value,
            answers=session.answers,
            currentQuestion=self._to_question_response(current_q) if current_q else None,
            nextQuestion=self._to_question_response(next_q) if next_q else None,
            progress=ProgressResponse(**progress),
        )

    def _build_completed(self, session: PaddleSelectorSession) -> SessionCompletedResponse:
        result = self._rec_svc.get_recommendation(session.answers)
        return SessionCompletedResponse(
            sessionId=session.id,
            status=session.status.value,
            answers=session.answers,
            recommendation=self._build_recommendation_response(result),
        )

    def _build_recommendation_response(self, result) -> RecommendationResponse:
        def to_product_result(pr) -> ProductResultResponse | None:
            if pr is None:
                return None
            product_resp = None
            if pr.product:
                product_resp = ProductResponse(
                    id=pr.product.id, name=pr.product.name, slug=pr.product.slug,
                    description=pr.product.description,
                    imageUrl=pr.product.imageUrl, productUrl=pr.product.productUrl,
                    price=pr.product.price, tags=pr.product.tags,
                )
            return ProductResultResponse(productName=pr.productName, product=product_resp, badge=pr.badge)

        return RecommendationResponse(
            matchType=result.matchType,
            ruleId=result.ruleId,
            recommendedForYou=to_product_result(result.recommendedForYou),
            bestSeller=to_product_result(result.bestSeller),
            otherPaddles=result.otherPaddles,
            metadata=RecommendationMetadata(**result.metadata),
        )

    def _to_question_response(self, q: Question | None) -> QuestionResponse | None:
        if q is None:
            return None
        return QuestionResponse(
            id=q.id, order=q.order, category=q.category,
            questionText=q.questionText, profileOnly=q.profileOnly,
            usedForExactLookup=q.usedForExactLookup,
            options=[QuestionOptionResponse(label=o.label, value=o.value) for o in q.options],
        )
