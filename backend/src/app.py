import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from src.routes.paddle_selector import router
from src.routes.chat import router as chat_router
from src.config import settings

logger = logging.getLogger(__name__)


def _validate_data_on_startup() -> None:
    """Load and validate all flat files on startup."""
    from src.repositories.question_repository import QuestionRepository
    from src.repositories.product_repository import ProductRepository
    from src.repositories.recommendation_rule_repository import RecommendationRuleRepository
    from src.repositories.dupr_rule_repository import DuprRuleRepository

    q_repo = QuestionRepository()
    p_repo = ProductRepository()
    r_repo = RecommendationRuleRepository()
    dupr_repo = DuprRuleRepository()

    questions = q_repo.get_all()
    lookup_fields = r_repo.get_lookup_fields()
    rules = r_repo.get_all()

    seen_keys: set[str] = set()
    from src.utils.rule_matcher import build_lookup_key
    for rule in rules:
        key = build_lookup_key(rule.answers, lookup_fields)
        if key in seen_keys:
            msg = f"Duplicate rule key: {key}"
            if settings.strict_recommendation_validation:
                raise RuntimeError(msg)
            logger.warning(msg)
        seen_keys.add(key)

    missing = [r.id for r in rules if r.requiresMerchandisingReview]
    if missing:
        logger.warning(
            f"{len(missing)} rules missing merchandising data (requiresMerchandisingReview=true). "
            "Run: python scripts/import_from_excel.py --file <path>"
        )
    # Check which recommended paddles actually match a catalog product.
    # Logs an actionable list of names that need attention (e.g. discontinued
    # models or naming mismatches between the rules and the live store).
    all_names: list[str] = []
    for r in rules:
        if r.recommendedForYou:
            all_names.append(r.recommendedForYou.productName)
        if r.bestSeller:
            all_names.append(r.bestSeller.productName)
        all_names.extend(r.otherPaddles)
    p_repo.report_unmatched(all_names)

    dupr_bands = dupr_repo.get_all()
    dupr_flow = q_repo.get_dupr_flow()
    if dupr_flow:
        logger.info(f"DUPR flow enabled: {len(dupr_bands)} bands, {len(dupr_flow.refiningQuestions)} refining questions.")
    else:
        logger.warning("DUPR flow not configured — duprFlow section missing from questions.json.")

    logger.info(
        f"Startup OK: {len(questions)} questions, "
        f"{len(p_repo.get_all())} products, {len(rules)} rules, {len(dupr_bands)} DUPR bands loaded."
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _validate_data_on_startup()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="JOOLA Paddle Selector API",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.include_router(router, prefix="/api")
    app.include_router(chat_router, prefix="/api")

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        # If detail is already {"error": ...}, return it directly
        if isinstance(exc.detail, dict) and "error" in exc.detail:
            return JSONResponse(status_code=exc.status_code, content=exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": "HTTP_ERROR", "message": str(exc.detail), "details": {}}},
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred.", "details": {}}},
        )

    return app
