from fastapi import HTTPException
from src.services.paddle_selector_service import PaddleSelectorService
from src.schemas.paddle_selector_schemas import (
    CreateSessionRequest, SubmitAnswerRequest, StatelessRecommendationRequest,
    ErrorDetail,
)

_svc = PaddleSelectorService()

ERROR_MAP = {
    "SESSION_NOT_FOUND": (404, "Session not found."),
    "INVALID_ANSWER": (422, "The selected answer is not valid for this question."),
    "INVALID_QUESTION_ID": (422, "Unknown question ID."),
    "OUT_OF_ORDER": (422, "Answer submitted out of order."),
    "SESSION_ALREADY_COMPLETED": (409, "Session is already completed."),
}


def _handle_service_error(exc: ValueError) -> HTTPException:
    code = str(exc).split(":")[0].strip()
    status, message = ERROR_MAP.get(code, (400, str(exc)))
    return HTTPException(
        status_code=status,
        detail={"error": ErrorDetail(code=code, message=message).model_dump()},
    )


async def health_check():
    return {"status": "ok"}


async def get_questions():
    return {"version": "1.0.0", "questions": [q.model_dump() for q in _svc.get_all_questions()]}


async def create_session(body: CreateSessionRequest):
    try:
        return _svc.create_session(source=body.source, locale=body.locale)
    except ValueError as e:
        raise _handle_service_error(e)


async def get_session(sessionId: str):
    try:
        return _svc.get_session(sessionId)
    except ValueError as e:
        raise _handle_service_error(e)


async def submit_answer(sessionId: str, body: SubmitAnswerRequest):
    try:
        return _svc.submit_answer(sessionId, body.questionId, body.answerValue)
    except ValueError as e:
        raise _handle_service_error(e)


async def restart_session(sessionId: str):
    try:
        return _svc.restart_session(sessionId)
    except ValueError as e:
        raise _handle_service_error(e)


async def get_recommendation(body: StatelessRecommendationRequest):
    return _svc.get_stateless_recommendation(body.answers)
