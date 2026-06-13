from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.schemas.paddle_selector_schemas import DuprFlowMetadata
from src.services.chat_service import ChatService, OPENING_MESSAGE, OPENING_UI_HINT

router = APIRouter()
_svc = ChatService()


class CreateChatSessionResponse(BaseModel):
    sessionId: str
    openingMessage: str
    openingUiHint: dict | None = None


class SendMessageRequest(BaseModel):
    message: str


class SendMessageResponse(BaseModel):
    sessionId: str
    assistantMessage: str
    isComplete: bool
    summary: str | None = None
    recommendation: dict | None = None
    uiHint: dict | None = None
    duprMetadata: DuprFlowMetadata | None = None


@router.post("/paddle-selector/chat/sessions", response_model=CreateChatSessionResponse)
def create_chat_session():
    session = _svc.create_session()
    return CreateChatSessionResponse(
        sessionId=session.session_id,
        openingMessage=OPENING_MESSAGE,
        openingUiHint=OPENING_UI_HINT,
    )


@router.post(
    "/paddle-selector/chat/sessions/{session_id}/message",
    response_model=SendMessageResponse,
)
def send_message(session_id: str, body: SendMessageRequest):
    try:
        result = _svc.send_message(session_id, body.message)
    except ValueError as exc:
        code = str(exc).split(":")[0].strip()
        if code == "CHAT_SESSION_NOT_FOUND":
            status = 404
        elif code == "CHAT_SESSION_ALREADY_COMPLETE":
            status = 409
        else:
            status = 400
        detail = {"error": {"code": code, "message": str(exc).split(":", 1)[-1].strip(), "details": {}}}
        raise HTTPException(status_code=status, detail=detail)

    dupr_meta = None
    if result.dupr_metadata is not None:
        dupr_meta = DuprFlowMetadata(**result.dupr_metadata)

    return SendMessageResponse(
        sessionId=result.session_id,
        assistantMessage=result.assistant_message,
        isComplete=result.is_complete,
        summary=result.summary,
        recommendation=result.recommendation.model_dump() if result.recommendation is not None else None,
        uiHint=result.ui_hint,
        duprMetadata=dupr_meta,
    )
