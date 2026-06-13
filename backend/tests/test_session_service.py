import pytest
from src.services.session_service import SessionService
from src.types.paddle_selector_types import SessionStatus


@pytest.fixture
def svc():
    return SessionService()


def test_create_session_returns_session_id(svc):
    session = svc.create_session()
    assert session.id is not None
    assert len(session.id) > 8
    assert session.status == SessionStatus.IN_PROGRESS


def test_first_question_is_skill_level(svc):
    session = svc.create_session()
    assert session.currentQuestionId == "skillLevel"


def test_submit_valid_answer_advances_question(svc):
    session = svc.create_session()
    updated = svc.submit_answer(session.id, "skillLevel", "beginner")
    assert updated.answers["skillLevel"] == "beginner"
    assert updated.currentQuestionId == "playFrequency"


def test_submit_invalid_answer_raises(svc):
    session = svc.create_session()
    with pytest.raises(ValueError, match="INVALID_ANSWER"):
        svc.submit_answer(session.id, "skillLevel", "expert")


def test_submit_wrong_question_raises(svc):
    session = svc.create_session()
    with pytest.raises(ValueError, match="OUT_OF_ORDER"):
        svc.submit_answer(session.id, "budget", "under_100")


def test_session_completes_after_final_answer(svc):
    session = svc.create_session()
    answers = [
        ("skillLevel", "beginner"),
        ("playFrequency", "occasionally"),
        ("budget", "under_100"),
        ("playPriority", "power"),
        ("twoHandedBackhand", "yes"),
        ("upgradeOpenness", "yes"),
        ("gripFeel", "small"),
    ]
    for q_id, answer in answers:
        session = svc.submit_answer(session.id, q_id, answer)
    assert session.status == SessionStatus.COMPLETED
    assert session.completedAt is not None


def test_get_session_not_found_raises(svc):
    with pytest.raises(ValueError, match="SESSION_NOT_FOUND"):
        svc.get_session("nonexistent-id")


def test_restart_creates_new_session(svc):
    session = svc.create_session()
    new_session = svc.restart_session(session.id)
    assert new_session.id != session.id
    assert new_session.status == SessionStatus.IN_PROGRESS
    assert new_session.currentQuestionId == "skillLevel"
