from __future__ import annotations
from pydantic import BaseModel, Field

# ── Requests ───────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    source: str = "website"
    locale: str = "en-US"


class SubmitAnswerRequest(BaseModel):
    questionId: str
    answerValue: str


class StatelessRecommendationRequest(BaseModel):
    answers: dict[str, str]


# ── Shared ─────────────────────────────────────────────────

class QuestionOptionResponse(BaseModel):
    label: str
    value: str


class QuestionResponse(BaseModel):
    id: str
    order: int
    category: str
    questionText: str
    profileOnly: bool
    usedForExactLookup: bool
    options: list[QuestionOptionResponse]


class ProgressResponse(BaseModel):
    answered: int
    total: int


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    imageUrl: str | None
    productUrl: str | None
    price: float | None
    tags: list[str]


class ProductResultResponse(BaseModel):
    productName: str
    product: ProductResponse | None
    badge: str


class RecommendationMetadata(BaseModel):
    fallbackUsed: bool
    requiresMerchandisingReview: bool


class RecommendationResponse(BaseModel):
    matchType: str
    ruleId: str | None = None
    recommendedForYou: ProductResultResponse | None = None
    bestSeller: ProductResultResponse | None = None
    otherPaddles: list[dict] = []
    metadata: RecommendationMetadata


# ── Session Responses ──────────────────────────────────────

class SessionInProgressResponse(BaseModel):
    sessionId: str
    status: str
    answers: dict[str, str]
    currentQuestion: QuestionResponse | None
    nextQuestion: QuestionResponse | None = None
    progress: ProgressResponse


class SessionCompletedResponse(BaseModel):
    sessionId: str
    status: str
    answers: dict[str, str]
    recommendation: RecommendationResponse


# ── DUPR ──────────────────────────────────────────────────

class DuprFlowMetadata(BaseModel):
    duprRating: float
    bandId: str
    bandLabel: str
    skillTier: str
    duprOverridden: bool


# ── Error ──────────────────────────────────────────────────

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)

