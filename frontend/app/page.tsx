"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import { createChatSession, sendChatMessage } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type {
  AIChatBubble,
  DuprFlowMetadata,
  QuickReply,
  Recommendation,
  ProductResult,
  TextInputUIHint,
} from "@/lib/types";

// ── AIAvatar ──────────────────────────────────────────────────

function AIAvatar() {
  return (
    <div
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: "var(--joola-black)",
        border: "1px solid var(--border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Image src="/joola-trinity.png" alt="" width={14} height={14} style={{ opacity: 0.9 }} />
    </div>
  );
}

// ── QuickReplyChips ───────────────────────────────────────────

function QuickReplyChips({
  options,
  onSelect,
  disabled,
}: {
  options: QuickReply[];
  onSelect: (value: string, label: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        marginTop: "0.625rem",
        paddingLeft: "2.375rem",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => !disabled && onSelect(opt.value, opt.label)}
          disabled={disabled}
          style={{
            background: disabled ? "transparent" : "var(--surface-2)",
            border: `1px solid ${disabled ? "var(--border)" : "var(--border-strong)"}`,
            borderRadius: "2px",
            color: disabled ? "var(--text-muted)" : "var(--text)",
            fontFamily: '"FK Grotesk Neue", sans-serif',
            fontSize: "0.875rem",
            fontWeight: 500,
            padding: "0.425rem 0.9rem",
            cursor: disabled ? "default" : "pointer",
            transition: "border-color 0.12s ease, background 0.12s ease",
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--joola-red)";
              el.style.background = "rgba(214,24,42,0.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--border-strong)";
              el.style.background = "var(--surface-2)";
            }
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── AIChatBubbleEl ────────────────────────────────────────────

function AIChatBubbleEl({
  text,
  quickReplies,
  chipsActive,
  onChipSelect,
}: {
  text: string;
  quickReplies?: QuickReply[];
  chipsActive?: boolean;
  onChipSelect?: (value: string, label: string) => void;
}) {
  return (
    <div className="animate-fade-up" style={{ maxWidth: "88%" }}>
      <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
        <AIAvatar />
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-strong)",
            borderRadius: "18px 18px 18px 4px",
            padding: "0.6875rem 1rem",
            fontSize: "0.9375rem",
            lineHeight: 1.5,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      </div>
      {quickReplies && quickReplies.length > 0 && onChipSelect && (
        <QuickReplyChips
          options={quickReplies}
          onSelect={onChipSelect}
          disabled={!chipsActive}
        />
      )}
    </div>
  );
}

// ── UserChatBubble ────────────────────────────────────────────

function UserChatBubble({ text }: { text: string }) {
  return (
    <div
      className="animate-fade-up"
      style={{ display: "flex", justifyContent: "flex-end", maxWidth: "82%", alignSelf: "flex-end" }}
    >
      <div
        style={{
          background: "var(--joola-red)",
          borderRadius: "18px 18px 4px 18px",
          padding: "0.6875rem 1rem",
          fontSize: "0.9375rem",
          lineHeight: 1.5,
          color: "#fff",
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ── ThinkingBubble ────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
      <AIAvatar />
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-strong)",
          borderRadius: "18px 18px 18px 4px",
          padding: "0.75rem 1rem",
          display: "flex",
          gap: "5px",
          alignItems: "center",
        }}
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--text-muted)",
              animation: "pulse-dot 1.2s ease-in-out infinite",
              animationDelay: `${delay}ms`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── ProgressIndicator ─────────────────────────────────────────

function ProgressIndicator({ step, total }: { step: number; total: number }) {
  if (!step || !total) return null;
  const pct = Math.min(100, (step / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
      <div
        style={{
          width: "80px",
          height: "3px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#fff",
            borderRadius: "2px",
            transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.625rem",
          color: "rgba(255,255,255,0.5)",
          fontFamily: '"FK Grotesk Mono", monospace',
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {step}/{total}
      </span>
    </div>
  );
}

// ── DuprTextInput ─────────────────────────────────────────────

function DuprTextInput({
  hint,
  onSubmit,
  disabled,
}: {
  hint: TextInputUIHint;
  onSubmit: (value: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--border-strong)",
        padding: "0.875rem 1.25rem",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flexShrink: 0,
      }}
    >
      {hint.helperText && (
        <span
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            fontFamily: '"FK Grotesk Mono", monospace',
            letterSpacing: "0.04em",
          }}
        >
          {hint.helperText}
        </span>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={hint.placeholder ?? "Type your answer…"}
          disabled={disabled}
          style={{
            flex: 1,
            background: "var(--bg)",
            border: "1px solid var(--border-strong)",
            borderRadius: "2px",
            color: "var(--text)",
            fontFamily: '"FK Grotesk Neue", sans-serif',
            fontSize: "0.9375rem",
            padding: "0.6rem 0.875rem",
            outline: "none",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          style={{
            background: "var(--joola-red)",
            border: "none",
            borderRadius: "2px",
            color: "#fff",
            fontFamily: '"FK Grotesk Neue", sans-serif',
            fontWeight: 700,
            fontSize: "0.875rem",
            padding: "0.6rem 1.125rem",
            cursor: disabled || !value.trim() ? "default" : "pointer",
            opacity: disabled || !value.trim() ? 0.5 : 1,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ── DuprBadge ─────────────────────────────────────────────────

function DuprBadge({ meta }: { meta: DuprFlowMetadata }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.75rem",
        padding: "0.5rem 0.875rem",
        background: "rgba(245,230,37,0.08)",
        border: "1px solid rgba(245,230,37,0.2)",
        borderRadius: "4px",
      }}
    >
      <span
        style={{
          fontFamily: '"FK Grotesk Mono", monospace',
          fontSize: "0.625rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--joola-yellow)",
        }}
      >
        DUPR {meta.duprRating}
      </span>
      <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
      <span
        style={{
          fontFamily: '"FK Grotesk Neue", sans-serif',
          fontSize: "0.75rem",
          color: "var(--text-2)",
        }}
      >
        {meta.bandLabel}
      </span>
      {meta.duprOverridden && (
        <>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
          <span
            style={{
              fontFamily: '"FK Grotesk Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--joola-red)",
            }}
          >
            Skill-matched
          </span>
        </>
      )}
    </div>
  );
}

// ── PaddleCardInline ──────────────────────────────────────────

const SHOP_FALLBACK = "https://joola.com/collections/pickleball-paddles";

function PaddleCardInline({
  result,
  featured,
}: {
  result: ProductResult;
  featured?: boolean;
}) {
  const product = result.product;
  const displayTags = (product?.tags ?? []).slice(0, 4);
  const ctaUrl = product?.productUrl ?? SHOP_FALLBACK;
  const ctaLabel = product?.productUrl ? "View paddle →" : "Shop JOOLA →";

  // ── Featured: large vertical store-style card ──
  if (featured) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(214,24,42,0.25)",
          borderTop: "3px solid var(--joola-red)",
          borderRadius: "4px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "240px",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {product?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={result.productName}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <Image src="/joola-trinity.png" alt="" width={48} height={48} style={{ opacity: 0.15 }} />
          )}
        </div>

        <div style={{ padding: "1.25rem" }}>
          {result.badge && (
            <span className="label-overline" style={{ display: "block", marginBottom: "0.4rem", color: "var(--joola-red)" }}>
              {result.badge}
            </span>
          )}
          <p
            style={{
              margin: "0 0 0.3rem",
              fontWeight: 700,
              fontSize: "1.15rem",
              color: "var(--text)",
              lineHeight: 1.3,
            }}
          >
            {result.productName}
          </p>

          {product?.price != null && (
            <p style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "var(--text)", fontWeight: 500 }}>
              ${product.price.toFixed(2)}
            </p>
          )}

          {displayTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "1rem" }}>
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.625rem",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "2px",
                    padding: "0.125rem 0.5rem",
                    color: "var(--text-muted)",
                    fontFamily: '"FK Grotesk Mono", monospace',
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.8125rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--joola-red)",
              border: "none",
              borderRadius: "2px",
              padding: "0.75rem",
              textDecoration: "none",
            }}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    );
  }

  // ── Non-featured: compact row ──
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "4px",
        padding: "0.875rem 1rem",
        display: "flex",
        gap: "0.875rem",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: "60px",
          height: "60px",
          borderRadius: "4px",
          background: "var(--surface-2)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {product?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={result.productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Image src="/joola-trinity.png" alt="" width={32} height={32} style={{ opacity: 0.15 }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {result.badge && (
          <span className="label-overline" style={{ display: "block", marginBottom: "0.3rem" }}>
            {result.badge}
          </span>
        )}
        <p
          style={{
            margin: "0 0 0.2rem",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--text)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {result.productName}
        </p>

        {product?.price != null && (
          <p style={{ margin: "0 0 0.4rem", fontSize: "0.8125rem", color: "var(--text-2)" }}>
            ${product.price.toFixed(0)}
          </p>
        )}

        {displayTags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.5rem" }}>
            {displayTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.625rem",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "2px",
                  padding: "0.125rem 0.5rem",
                  color: "var(--text-muted)",
                  fontFamily: '"FK Grotesk Mono", monospace',
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            fontWeight: 700,
            fontSize: "0.6875rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text)",
            background: "var(--joola-yellow)",
            border: "none",
            borderRadius: "2px",
            padding: "0.3rem 0.75rem",
            textDecoration: "none",
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}

// ── CollectionsRow ────────────────────────────────────────────

const JOOLA_COLLECTIONS = [
  { id: "all-paddles",  label: "All Paddles",  url: "https://joola.com/collections/pickleball-paddles" },
  { id: "pro-paddles",  label: "Pro Paddles",  url: "https://joola.com/collections/professional-pickleball-paddles" },
  { id: "pro-v",        label: "Pro V",        url: "https://joola.com/collections/pro-v" },
  { id: "performance",  label: "Performance",  url: "https://joola.com/collections/pickleball-paddles-performance" },
  { id: "recreational", label: "Recreational", url: "https://joola.com/collections/recreational-pickleball-paddles" },
  { id: "3s",           label: "3S",           url: "https://joola.com/collections/joola-3s" },
];

function CollectionsRow() {
  return (
    <div
      style={{
        marginTop: "1.25rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--border-strong)",
      }}
    >
      <span className="label-overline" style={{ display: "block", marginBottom: "0.625rem" }}>
        Shop JOOLA Collections
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {JOOLA_COLLECTIONS.map((c) => (
          <a
            key={c.id}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontSize: "0.6875rem",
              fontFamily: '"FK Grotesk Neue", sans-serif',
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text)",
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: "2px",
              padding: "0.3rem 0.7rem",
              textDecoration: "none",
            }}
          >
            {c.label} →
          </a>
        ))}
      </div>
    </div>
  );
}

// ── RecommendationSection ─────────────────────────────────────

function RecommendationSection({
  rec,
  summary,
  duprMeta,
  onRestart,
}: {
  rec: Recommendation;
  summary?: string | null;
  duprMeta?: DuprFlowMetadata | null;
  onRestart: () => void;
}) {
  const hasDifferentBestSeller =
    rec.bestSeller &&
    rec.recommendedForYou?.productName !== rec.bestSeller.productName;

  return (
    <div className="animate-fade-up" style={{ marginTop: "1rem" }}>
      {duprMeta && <DuprBadge meta={duprMeta} />}
      {/* Match hero banner */}
      <div
        style={{
          background: "var(--joola-black)",
          borderRadius: "4px",
          padding: "1.25rem",
          marginBottom: "0.875rem",
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: '"FK Grotesk Mono", monospace',
            fontSize: "0.6rem",
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--joola-yellow)",
            marginBottom: "0.5rem",
          }}
        >
          Your Match
        </span>
        <p
          style={{
            margin: 0,
            fontWeight: 900,
            fontSize: "1.375rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            color: "#fff",
          }}
        >
          We found your
          <br />
          <span style={{ color: "var(--joola-yellow)" }}>perfect paddle.</span>
        </p>
      </div>

      {/* Why this paddle */}
      {summary && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderLeft: "3px solid var(--border-strong)",
            borderRadius: "4px",
            padding: "0.875rem 1rem",
            marginBottom: "0.75rem",
          }}
        >
          <span className="label-overline" style={{ display: "block", marginBottom: "0.4rem" }}>
            Why this paddle
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--text-2)",
              lineHeight: 1.6,
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {/* Paddle cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {rec.recommendedForYou && (
          <PaddleCardInline result={rec.recommendedForYou} featured />
        )}

        {hasDifferentBestSeller && rec.bestSeller && (
          <PaddleCardInline result={rec.bestSeller} />
        )}

        {rec.otherPaddles.length > 0 && (
          <>
            <p className="label-overline" style={{ marginTop: "0.25rem", paddingLeft: "0.125rem" }}>
              Also consider
            </p>
            {rec.otherPaddles.slice(0, 3).map((p, i) => {
              const name =
                (p as { productName?: string }).productName ??
                (p as { name?: string }).name ??
                "Paddle Option";
              const url =
                (p as { productUrl?: string }).productUrl ?? SHOP_FALLBACK;
              return (
                <div
                  key={i}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "4px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--text)" }}>
                    {name}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--joola-red)",
                      textDecoration: "none",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    View →
                  </a>
                </div>
              );
            })}
          </>
        )}
      </div>

      <CollectionsRow />

      <button
        onClick={onRestart}
        style={{
          display: "block",
          margin: "1.5rem auto 0",
          background: "none",
          border: "1px solid var(--border-strong)",
          borderRadius: "2px",
          color: "var(--text-2)",
          fontFamily: '"FK Grotesk Neue", sans-serif',
          fontWeight: 600,
          fontSize: "0.8125rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          padding: "0.6rem 1.5rem",
          cursor: "pointer",
        }}
      >
        Start Over
      </button>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────

type Phase = "loading" | "active" | "thinking" | "complete" | "error";

const OPENING_CHIPS: QuickReply[] = [
  { label: "Yes, I know my DUPR", value: "yes" },
  { label: "No, ask me questions", value: "no" },
];

export default function HomePage() {
  const [restartKey, setRestartKey] = useState(0);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<AIChatBubble[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [duprMeta, setDuprMeta] = useState<DuprFlowMetadata | null>(null);

  const [progressStep, setProgressStep] = useState<number>(0);
  const [progressTotal, setProgressTotal] = useState<number>(6);
  const [textInputHint, setTextInputHint] = useState<TextInputUIHint | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(null);
    setBubbles([]);
    setPhase("loading");
    setRecommendation(null);
    setSummary(null);
    setDuprMeta(null);
    setProgressStep(0);
    setProgressTotal(6);
    setTextInputHint(null);

    createChatSession()
      .then((session) => {
        setSessionId(session.sessionId);
        const chips =
          session.openingUiHint?.type === "chips"
            ? session.openingUiHint.options
            : OPENING_CHIPS;
        const openingBubble: AIChatBubble = {
          id: "open",
          role: "ai",
          text: session.openingMessage,
          quickReplies: chips,
        };
        setBubbles([openingBubble]);
        setPhase("active");
      })
      .catch(() => setPhase("error"));
  }, [restartKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles, phase]);

  const lastAIBubbleId = bubbles.filter((b) => b.role === "ai").slice(-1)[0]?.id;
  const showProgress = progressStep > 0 && progressTotal > 0;

  const handleSendMessage = useCallback(
    async (messageText: string, displayText?: string) => {
      const textToShow = displayText ?? messageText;
      if (!textToShow.trim() || !sessionId || phase !== "active") return;

      setBubbles((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", text: textToShow },
      ]);
      setPhase("thinking");

      try {
        const result = await sendChatMessage(sessionId, messageText);

        const newBubble: AIChatBubble = {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: result.assistantMessage,
          quickReplies:
            result.uiHint?.type === "chips" ? result.uiHint.options : undefined,
        };
        setBubbles((prev) => [...prev, newBubble]);

        if (result.uiHint?.type === "text_input") {
          setTextInputHint(result.uiHint);
          setProgressStep(0);
        } else {
          setTextInputHint(null);
          if (result.uiHint?.type === "chips") {
            const hint = result.uiHint;
            if (hint.progressStep != null) setProgressStep(hint.progressStep);
            if (hint.progressTotal != null) setProgressTotal(hint.progressTotal);
          }
        }

        if (result.isComplete) {
          setRecommendation(result.recommendation);
          setSummary(result.summary ?? null);
          if (result.duprMetadata) {
            setDuprMeta(result.duprMetadata);
            trackEvent({
              event: "recommendation_shown",
              recommendedPaddle: result.recommendation?.recommendedForYou?.productName ?? "",
              duprOverridden: result.duprMetadata.duprOverridden,
              flow: "dupr",
            });
          } else {
            trackEvent({
              event: "recommendation_shown",
              recommendedPaddle: result.recommendation?.recommendedForYou?.productName ?? "",
              duprOverridden: false,
              flow: "standard",
            });
          }
          setPhase("complete");
        } else {
          setPhase("active");
        }
      } catch {
        setBubbles((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "ai",
            text: "Something went wrong. Please try again.",
          },
        ]);
        setPhase("active");
      }
    },
    [sessionId, phase]
  );

  function handleChipSelect(value: string, label: string) {
    if (bubbles.length === 1 && bubbles[0].id === "open") {
      trackEvent({ event: value === "yes" ? "dupr_flow_started" : "standard_flow_started" });
    }
    handleSendMessage(value, label);
  }

  function handleRestart() {
    setRestartKey((k) => k + 1);
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: "640px",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            padding: "0.875rem 1.25rem",
            background: "var(--joola-black)",
            flexShrink: 0,
          }}
        >
          <Image src="/joola-logo-white.svg" alt="JOOLA" width={60} height={18} />

          <div
            style={{
              width: "1px",
              height: "16px",
              background: "rgba(255,255,255,0.15)",
            }}
          />

          <span
            style={{
              fontFamily: '"FK Grotesk Mono", monospace',
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Paddle Selector
          </span>

          <div style={{ marginLeft: "auto" }}>
            {showProgress ? (
              <ProgressIndicator step={progressStep} total={progressTotal} />
            ) : (
              <span
                style={{
                  fontFamily: '"FK Grotesk Mono", monospace',
                  fontSize: "0.6rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--joola-yellow)",
                  background: "rgba(245,230,37,0.12)",
                  border: "1px solid rgba(245,230,37,0.25)",
                  borderRadius: "2px",
                  padding: "0.25rem 0.625rem",
                }}
              >
                AI Advisor
              </span>
            )}
          </div>
        </div>

        {/* ── Message list ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            background: "var(--bg)",
          }}
        >
          {phase === "loading" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "3px solid var(--surface-3)",
                  borderTopColor: "var(--joola-red)",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          )}

          {phase === "error" && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p
                style={{
                  color: "var(--joola-red)",
                  marginBottom: "1rem",
                  fontSize: "0.9375rem",
                }}
              >
                Failed to start chat. Please check that the backend is running.
              </p>
              <button
                onClick={handleRestart}
                style={{
                  background: "var(--joola-red)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "2px",
                  padding: "0.6rem 1.5rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Try again
              </button>
            </div>
          )}

          {bubbles.map((b) =>
            b.role === "ai" ? (
              <AIChatBubbleEl
                key={b.id}
                text={b.text}
                quickReplies={b.quickReplies}
                chipsActive={b.id === lastAIBubbleId && phase === "active"}
                onChipSelect={handleChipSelect}
              />
            ) : (
              <UserChatBubble key={b.id} text={b.text} />
            )
          )}

          {phase === "thinking" && <ThinkingBubble />}

          {phase === "complete" && recommendation && (
            <RecommendationSection
              rec={recommendation}
              summary={summary}
              duprMeta={duprMeta}
              onRestart={handleRestart}
            />
          )}

          {phase === "complete" && !recommendation && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
                No specific paddle match found — but check out JOOLA&apos;s full lineup!
              </p>
              <button
                onClick={handleRestart}
                style={{
                  marginTop: "0.75rem",
                  background: "none",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "2px",
                  color: "var(--text-2)",
                  fontFamily: '"FK Grotesk Neue", sans-serif',
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: "0.6rem 1.5rem",
                  cursor: "pointer",
                }}
              >
                Start over
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {textInputHint && phase === "active" && (
          <DuprTextInput
            hint={textInputHint}
            onSubmit={(v) => handleSendMessage(v, v)}
            disabled={phase !== "active"}
          />
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}