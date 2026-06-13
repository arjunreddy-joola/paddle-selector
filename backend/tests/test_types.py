from src.types.paddle_selector_types import (
    Question, QuestionOption, PaddleProduct,
    RecommendationRule, PaddleSelectorSession, SessionStatus
)


def test_question_has_required_fields():
    q = Question(
        id="skillLevel", order=0, category="Player Level + Profile",
        questionText="What's your skill level?", profileOnly=True,
        usedForExactLookup=False, options=[]
    )
    assert q.id == "skillLevel"
    assert q.profileOnly is True


def test_session_default_status():
    from datetime import datetime
    import uuid
    s = PaddleSelectorSession(
        id=str(uuid.uuid4()), status=SessionStatus.IN_PROGRESS,
        currentQuestionId="skillLevel", answers={},
        createdAt=datetime.utcnow(), updatedAt=datetime.utcnow(),
        completedAt=None
    )
    assert s.status == SessionStatus.IN_PROGRESS
