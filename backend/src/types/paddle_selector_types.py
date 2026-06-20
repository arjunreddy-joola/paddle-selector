from __future__ import annotations
from enum import Enum
from datetime import datetime
from pydantic import BaseModel


class SessionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class QuestionOption(BaseModel):
    label: str
    value: str
    excelValue: str | None = None


class Question(BaseModel):
    id: str
    order: int
    category: str
    questionText: str
    profileOnly: bool
    usedForExactLookup: bool
    excelColumn: str | None = None
    options: list[QuestionOption]


class DuprBandProductDefaults(BaseModel):
    recommendedForYou: str | None = None
    bestSeller: str | None = None
    alsoConsider: list[str] = []


class DuprBandByPlayPriority(BaseModel):
    power: DuprBandProductDefaults = DuprBandProductDefaults()
    control: DuprBandProductDefaults = DuprBandProductDefaults()
    spin: DuprBandProductDefaults = DuprBandProductDefaults()
    balance: DuprBandProductDefaults = DuprBandProductDefaults()


class DuprBand(BaseModel):
    id: str
    label: str
    minDupr: float
    maxDupr: float
    skillTier: str
    theme: str
    hiddenPlayFrequency: str
    hiddenUpgradeOpenness: str
    recommendationBias: str
    explanationTemplate: str
    primaryPool: list[str]
    defaults: DuprBandProductDefaults
    byPlayPriority: DuprBandByPlayPriority


class DuprRulesFile(BaseModel):
    version: str
    bands: list[DuprBand]


class DuprRefiningQuestion(BaseModel):
    questionId: str
    duprQuestionText: str
    order: int


class DuprRatingInputConfig(BaseModel):
    id: str
    questionText: str
    inputType: str
    placeholder: str
    helperText: str
    errorMessage: str
    min: float
    max: float
    step: float


class DuprOpeningQuestion(BaseModel):
    id: str
    questionText: str
    options: list[QuestionOption]


class DuprFlow(BaseModel):
    openingQuestion: DuprOpeningQuestion
    duprRatingInput: DuprRatingInputConfig
    refiningQuestions: list[DuprRefiningQuestion]


class QuestionsFile(BaseModel):
    version: str
    questions: list[Question]
    duprFlow: DuprFlow | None = None


class PaddleProduct(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    imageUrl: str | None = None
    productUrl: str | None = None
    price: float | None = None
    tags: list[str] = []
    isActive: bool = True


class ProductsFile(BaseModel):
    version: str
    products: list[PaddleProduct]


class RecommendedProduct(BaseModel):
    productName: str
    source: str  # "notes" | "fallback"


class RecommendationRule(BaseModel):
    id: str
    comboNumber: int
    answers: dict[str, str]
    excelAnswers: dict[str, str]
    recommendedForYou: RecommendedProduct | None = None
    bestSeller: RecommendedProduct | None = None
    otherPaddles: list[str] = []
    rawProductList: str
    rawNotes: str
    requiresMerchandisingReview: bool = False
    fallbackUsed: bool = False


class RecommendationRulesFile(BaseModel):
    version: str
    source: str
    lookupFields: list[str]
    rules: list[RecommendationRule]


class PaddleSelectorSession(BaseModel):
    id: str
    status: SessionStatus
    currentQuestionId: str | None
    answers: dict[str, str]
    source: str = "website"
    locale: str = "en-US"
    createdAt: datetime
    updatedAt: datetime
    completedAt: datetime | None = None


class SessionsFile(BaseModel):
    sessions: list[PaddleSelectorSession]
