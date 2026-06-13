export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  order: number;
  category: string;
  questionText: string;
  profileOnly: boolean;
  usedForExactLookup: boolean;
  options: QuestionOption[];
}

export interface Progress {
  answered: number;
  total: number;
}

export interface SessionInProgress {
  sessionId: string;
  status: "in_progress";
  answers: Record<string, string>;
  currentQuestion: Question | null;
  nextQuestion?: Question | null;
  progress: Progress;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productUrl: string | null;
  price: number | null;
  tags: string[];
}

export interface ProductResult {
  productName: string;
  product: Product | null;
  badge: string;
}

export interface RecommendationMetadata {
  fallbackUsed: boolean;
  requiresMerchandisingReview: boolean;
}

export interface Recommendation {
  matchType: string;
  ruleId: string | null;
  recommendedForYou: ProductResult | null;
  bestSeller: ProductResult | null;
  otherPaddles: Record<string, unknown>[];
  metadata: RecommendationMetadata;
}

export interface SessionCompleted {
  sessionId: string;
  status: "completed";
  answers: Record<string, string>;
  recommendation: Recommendation;
}

export type Session = SessionInProgress | SessionCompleted;

export interface ChatMessage {
  id: string;
  type: "question" | "answer";
  category?: string;
  text: string;
  questionId?: string;
}

export interface SubmittedAnswer {
  questionId: string;
  answerValue: string;
  answerLabel: string;
  category: string;
  questionText: string;
}

// ── UI Hint types ────────────────────────────────────────────

export interface QuickReply {
  label: string;
  value: string;
}

export interface ChipsUIHint {
  type: "chips";
  options: QuickReply[];
  progressStep?: number;
  progressTotal?: number;
}

export interface TextInputUIHint {
  type: "text_input";
  placeholder?: string;
  helperText?: string;
  min?: number;
  max?: number;
}

export type UIHint = ChipsUIHint | TextInputUIHint;

export interface DuprFlowMetadata {
  duprRating: number;
  bandId: string;
  bandLabel: string;
  skillTier: string;
  duprOverridden: boolean;
}

// ── AI Chat types ───────────────────────────────────────────

export interface AIChatSession {
  sessionId: string;
  openingMessage: string;
  openingUiHint?: UIHint | null;
}

export interface AIChatMessageResponse {
  sessionId: string;
  assistantMessage: string;
  isComplete: boolean;
  summary: string | null;
  recommendation: Recommendation | null;
  uiHint?: UIHint | null;
  duprMetadata?: DuprFlowMetadata | null;
}

export interface AIChatBubble {
  id: string;
  role: "ai" | "user";
  text: string;
  quickReplies?: QuickReply[];
}
