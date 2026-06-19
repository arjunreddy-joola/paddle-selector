from fastapi import APIRouter
from src.controllers import paddle_selector_controller as ctrl

router = APIRouter()

router.get("/health")(ctrl.health_check)
router.get("/paddle-selector/questions")(ctrl.get_questions)
router.post("/paddle-selector/sessions")(ctrl.create_session)
router.get("/paddle-selector/sessions/{sessionId}")(ctrl.get_session)
router.post("/paddle-selector/sessions/{sessionId}/answer")(ctrl.submit_answer)
router.post("/paddle-selector/sessions/{sessionId}/restart")(ctrl.restart_session)
router.post("/paddle-selector/recommendations")(ctrl.get_recommendation)
